import { Router } from 'express';
import { getUserBySession } from '../services/auth.service';
import { getOrderById, listOrders } from '../services/orders.service';
import { getCookie, SESSION_COOKIE } from '../utils/cookies';

export const ordersRouter = Router();

const resolveUser = (req: { headers: { cookie?: string } }) => {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (!sessionId) {
    return null;
  }
  return getUserBySession(sessionId);
};

ordersRouter.get('/', (req, res) => {
  const user = resolveUser(req);
  if (!user) {
    res.status(401).json({ message: 'Non autenticato.' });
    return;
  }

  const orders = listOrders(user.id);
  res.json(orders);
});

ordersRouter.get('/:id', (req, res) => {
  const user = resolveUser(req);
  if (!user) {
    res.status(401).json({ message: 'Non autenticato.' });
    return;
  }

  const order = getOrderById(user.id, req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Ordine non trovato.' });
    return;
  }
  res.json(order);
});
