import { Request, Router } from 'express';
import Stripe from 'stripe';
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from '@org/shared';
import { getUserBySession } from '../services/auth.service';
import { createOrder } from '../services/orders.service';
import { getCookie, SESSION_COOKIE } from '../utils/cookies';

export const paymentsRouter = Router();

const stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:4200';

const resolveUser = (req: Request) => {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (!sessionId) {
    return null;
  }
  return getUserBySession(sessionId);
};

paymentsRouter.post('/checkout-session', async (req, res) => {
  const user = resolveUser(req);
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
