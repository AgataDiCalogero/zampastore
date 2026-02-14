import express, { Router } from 'express';
import Stripe from 'stripe';
import { CreateCheckoutSessionResponse } from '@zampa/shared';
import {
  createOrder,
  OrderCreationError,
  updateOrderStatus,
} from '../services/orders.service';
import { getEnv } from '../config/env';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrf } from '../middleware/csrf.middleware';
import { mapDbError } from '../utils/db-errors';
import { parseCheckoutRequest } from '../services/checkout.validation';
import { stripeEventsStore } from '../services/stripe-events.store';

export const paymentsRouter = Router();

const env = getEnv();
const stripeKey = env.stripeSecretKey?.trim();
const webhookSecret = env.stripeWebhookSecret?.trim();
const isPlaceholderKey = (key: string): boolean => {
  const lowered = key.toLowerCase();
  return (
    lowered.includes('replace') ||
    lowered.includes('xxx') ||
    lowered === 'sk_test' ||
    lowered === 'sk_live'
  );
};
const stripe =
  stripeKey && stripeKey.startsWith('sk_') && !isPlaceholderKey(stripeKey)
    ? new Stripe(stripeKey)
    : null;

const clientUrl = env.clientUrl;

type CreatedOrder = Awaited<ReturnType<typeof createOrder>>;
type AuthenticatedUser = NonNullable<express.Request['authUser']>;
type CheckoutPayload = Extract<
  ReturnType<typeof parseCheckoutRequest>,
  { ok: true }
>['data'];

const isCheckoutSessionCompletedEvent = (
  event: Stripe.Event,
): event is Stripe.Event & {
  type: 'checkout.session.completed';
  data: { object: Stripe.Checkout.Session };
} => event.type === 'checkout.session.completed';

const sendOrderPaidResponse = (
  res: express.Response,
  orderId: string,
  url: string,
): void => {
  const response: CreateCheckoutSessionResponse = {
    url,
    orderId,
  };
  res.json(response);
};

const markOrderPaidOr500 = async (
  res: express.Response,
  userId: string,
  orderId: string,
  url: string,
): Promise<boolean> => {
  const updated = await updateOrderStatus(userId, orderId, 'paid');
  if (!updated) {
    res
      .status(500)
      .json({ message: 'Impossibile aggiornare lo stato ordine.' });
    return false;
  }
  sendOrderPaidResponse(res, orderId, url);
  return true;
};

const handleOrderCreationError = (
  res: express.Response,
  error: unknown,
): boolean => {
  if (!(error instanceof OrderCreationError)) {
    return false;
  }

  if (error.code === 'out-of-stock') {
    res.status(409).json({ message: 'Prodotto esaurito.' });
    return true;
  }

  res.status(400).json({ message: 'Prodotti non validi.' });
  return true;
};

const getAuthenticatedUser = (
  req: express.Request,
  res: express.Response,
): AuthenticatedUser | null => {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ message: 'Non autenticato.' });
    return null;
  }
  return user;
};

const parseCheckoutPayload = (
  req: express.Request,
  res: express.Response,
): CheckoutPayload | null => {
  const parsed = parseCheckoutRequest(req.body);
  if (!parsed.ok) {
    res.status(400).json({ message: parsed.message });
    return null;
  }
  return parsed.data;
};

const createOrderOrRespond = async (
  res: express.Response,
  userId: string,
  payload: CheckoutPayload,
): Promise<CreatedOrder | null> => {
  try {
    const order = await createOrder(
      userId,
      payload.items,
      payload.shippingAddress,
    );
    if (!order) {
      res.status(500).json({ message: 'Impossibile creare l’ordine.' });
      return null;
    }
    return order;
  } catch (error) {
    if (handleOrderCreationError(res, error)) {
      return null;
    }
    throw error;
  }
};

const createStripeSession = (
  stripeClient: Stripe,
  order: CreatedOrder,
  user: AuthenticatedUser,
  successUrl: string,
  cancelUrl: string,
): Promise<Stripe.Checkout.Session> =>
  stripeClient.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    client_reference_id: order.id,
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
    line_items: order.items.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: 'eur',
        unit_amount: item.unitPriceCents,
        product_data: {
          name: item.name,
        },
      },
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: user.email,
  });

const handleStripeCheckout = async (
  res: express.Response,
  user: AuthenticatedUser,
  order: CreatedOrder,
  successUrl: string,
  cancelUrl: string,
): Promise<void> => {
  // 1. Production Security Check
  if (!stripe) {
    res.status(500).json({ message: 'Payment system configuration error' });
    return;
  }

  try {
    const session = await createStripeSession(
      stripe,
      order,
      user,
      successUrl,
      cancelUrl,
    );

    if (!session.url) {
      res
        .status(500)
        .json({ message: 'Sessione Stripe senza URL di redirect.' });
      return;
    }

    // Auto-pay removed as per user request to allow testing of payment flow / cancellation.
    // if (shouldAutoPaidForTest) {
    //   const updated = await updateOrderStatus(user.id, order.id, 'paid');
    //   if (!updated) {
    //     console.warn(`Unable to auto-mark order ${order.id} as paid.`);
    //   }
    // }

    sendOrderPaidResponse(res, order.id, session.url);
  } catch (error) {
    // We do NOT fallback if Stripe fails

    console.error('Stripe session error', error);
    res
      .status(500)
      .json({ message: 'Impossibile creare la sessione di pagamento.' });
  }
};

paymentsRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe || !webhookSecret) {
      res.status(501).json({ message: 'Webhook Stripe non configurato.' });
      return;
    }
    const signature = req.headers['stripe-signature'];
    if (!signature || Array.isArray(signature)) {
      res.status(400).json({ message: 'Firma Stripe mancante.' });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch {
      res.status(400).json({ message: 'Firma Stripe non valida.' });
      return;
    }

    const recorded = await stripeEventsStore.recordEvent(event.id, event.type);
    if (!recorded) {
      res.json({ received: true, duplicate: true });
      return;
    }

    if (isCheckoutSessionCompletedEvent(event)) {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;
      if (!orderId || !userId) {
        res.status(400).json({ message: 'Metadata ordine mancante.' });
        return;
      }
      const updated = await updateOrderStatus(userId, orderId, 'paid');
      if (!updated) {
        res.status(404).json({ message: 'Ordine non trovato.' });
        return;
      }
    }

    res.json({ received: true });
  },
);

paymentsRouter.post(
  '/checkout-session',
  requireAuth,
  requireCsrf,
  async (req, res) => {
    try {
      const user = getAuthenticatedUser(req, res);
      if (!user) {
        return;
      }

      const payload = parseCheckoutPayload(req, res);
      if (!payload) {
        return;
      }

      const order = await createOrderOrRespond(res, user.id, payload);
      if (!order) {
        return;
      }

      const successUrl = `${clientUrl}/ordine-confermato?orderId=${order.id}`;
      const cancelUrl = `${clientUrl}/carrello`;
      const isE2e = req.headers['x-e2e-test'] === 'true';

      if (isE2e) {
        if (process.env.NODE_ENV === 'production') {
          res
            .status(403)
            .json({ message: 'E2E test headers not allowed in production' });
          return;
        }
        await markOrderPaidOr500(res, user.id, order.id, successUrl);
        return;
      }

      await handleStripeCheckout(res, user, order, successUrl, cancelUrl);
    } catch (error) {
      const mapped = mapDbError(error);
      if (mapped) {
        res.status(mapped.status).json({ message: mapped.message });
        return;
      }
      res
        .status(500)
        .json({ message: 'Errore durante la creazione del checkout.' });
    }
  },
);
