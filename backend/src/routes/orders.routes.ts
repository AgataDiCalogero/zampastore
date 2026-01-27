import { Request, Router } from 'express';
import { authService } from '../services/auth.service';
import { getOrderById, listOrders } from '../services/orders.service';
import { getCookie, SESSION_COOKIE } from '../utils/cookies';

export const ordersRouter = Router();

const resolveUser = async (req: Request) => {
  const sessionId = getCookie(req, SESSION_COOKIE);
  if (!sessionId) {
    return null;
  }
  return authService.getUserBySession(sessionId);
};

ordersRouter.get('/', async (req, res) => {
  const user = await resolveUser(req);
  if (!user) {
    res.status(401).json({ message: 'Non autenticato.' });
    return;
  }

  const orders = listOrders(user.id);
  res.json(orders);
});

ordersRouter.get('/:id', async (req, res) => {
  const user = await resolveUser(req);
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
