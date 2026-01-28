import { Router } from 'express';
import Stripe from 'stripe';
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from '@org/shared';
import { createOrder } from '../services/orders.service';
import { getEnv } from '../config/env';
import { requireAuth } from '../middleware/auth.middleware';

export const paymentsRouter = Router();

const env = getEnv();
const stripeKey = env.stripeSecretKey;
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const clientUrl = env.clientUrl;

paymentsRouter.post('/checkout-session', requireAuth, async (req, res) => {
  const user = req.authUser;
  if (!user) {
    res.status(401).json({ message: 'Non autenticato.' });
    return;
  }

  const payload = req.body as CreateCheckoutSessionRequest | undefined;
  if (
    !payload ||
    !Array.isArray(payload.items) ||
    payload.items.length === 0 ||
    !payload.shippingAddress
  ) {
    res.status(400).json({ message: 'Dati checkout non validi.' });
    return;
  }

  const order = createOrder(user.id, payload.items, payload.shippingAddress);
  if (!order) {
    res.status(400).json({ message: 'Prodotti non validi.' });
    return;
  }

  const successUrl = `${clientUrl}/ordine-confermato?orderId=${order.id}`;
  const cancelUrl = `${clientUrl}/carrello`;

  if (!stripe) {
    const response: CreateCheckoutSessionResponse = {
      url: successUrl,
      orderId: order.id,
    };
    res.json(response);
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
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

    if (!session.url) {
      res
        .status(500)
        .json({ message: 'Sessione Stripe senza URL di redirect.' });
      return;
    }

    const response: CreateCheckoutSessionResponse = {
      url: session.url,
      orderId: order.id,
    };
    res.json(response);
  } catch {
    res
      .status(500)
      .json({ message: 'Impossibile creare la sessione di pagamento.' });
  }
});
