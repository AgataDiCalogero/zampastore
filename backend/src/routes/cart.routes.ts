import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrf } from '../middleware/csrf.middleware';
import { mapDbError } from '../utils/db-errors';
import { parseIdParam } from '../services/params.validation';
import {
  parseCartItem,
  parseCartMerge,
  parseCartQty,
} from '../services/cart.validation';
import { cartStore } from '../services/cart.store';

export const cartRouter = Router();

cartRouter.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }
    const items = await cartStore.listCart(user.id);
    res.json(items);
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: 'Errore durante il recupero carrello.' });
  }
});

cartRouter.post('/merge', requireAuth, requireCsrf, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }
    const parsed = parseCartMerge(req.body);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    await cartStore.mergeItems(user.id, parsed.data.items);
    res.status(204).send();
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: 'Errore durante l\'aggiornamento carrello.' });
  }
});

cartRouter.post('/items', requireAuth, requireCsrf, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }
    const parsed = parseCartItem(req.body);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    await cartStore.addItem(user.id, parsed.data.productId, parsed.data.qty);
    res.status(204).send();
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: 'Errore durante l\'aggiunta al carrello.' });
  }
});

cartRouter.patch('/items/:productId', requireAuth, requireCsrf, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }
    const idParsed = parseIdParam(req.params.productId);
    if (!idParsed.ok) {
      res.status(400).json({ message: idParsed.message });
      return;
    }
    const parsed = parseCartQty(req.body);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const updated = await cartStore.setItem(
      user.id,
      idParsed.data,
      parsed.data.qty,
    );
    if (!updated) {
      res.status(404).json({ message: 'Elemento carrello non trovato.' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: 'Errore durante l\'aggiornamento carrello.' });
  }
});

cartRouter.delete('/items/:productId', requireAuth, requireCsrf, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }
    const parsed = parseIdParam(req.params.productId);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    await cartStore.removeItem(user.id, parsed.data);
    res.status(204).send();
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: 'Errore durante la rimozione dal carrello.' });
  }
});

cartRouter.delete('/', requireAuth, requireCsrf, async (req, res) => {
  try {
    const user = req.authUser;
    if (!user) {
      res.status(401).json({ message: 'Non autenticato.' });
      return;
    }
    await cartStore.clearCart(user.id);
    res.status(204).send();
  } catch (error) {
    const mapped = mapDbError(error);
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }
    res.status(500).json({ message: 'Errore durante lo svuotamento carrello.' });
  }
});
