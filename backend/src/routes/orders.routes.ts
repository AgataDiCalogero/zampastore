import { Router } from 'express';
import { getOrderById, listOrders } from '../services/orders.service';
import { requireAuth } from '../middleware/auth.middleware';
import { mapDbError } from '../utils/db-errors';
import { parseIdParam } from '../services/params.validation';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }

    const orders = await listOrders(user.id);
    res.json(orders);
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
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

    const parsed = parseIdParam(req.params.id);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }

    const order = await getOrderById(user.id, parsed.data);
    if (!order) {
      res.status(404).json({ message: 'Ordine non trovato.' });
      return;
    }
    res.json(order);
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: 'Errore durante il recupero ordine.' });
  }
});
