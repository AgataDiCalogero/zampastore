import { Router } from 'express';
import { getOrderById, listOrders } from '../services/orders.service';
import { requireAuth } from '../middleware/auth.middleware';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }

    const orders = listOrders(user.id);
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Errore durante il recupero ordini.' });
  }
});

ordersRouter.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.authUser;
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
  } catch {
    res.status(500).json({ message: 'Errore durante il recupero ordine.' });
  }
});
