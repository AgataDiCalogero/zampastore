import { Router } from 'express';
import { productsStore } from '../services/products.store';
import { parseIdParam } from '../services/params.validation';

export const productsRouter = Router();

productsRouter.get('/', async (req, res, next) => {
  try {
    const category =
      typeof req.query['category'] === 'string'
        ? req.query['category']
        : undefined;
    const products = await productsStore.listProducts(category);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/seed', async (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ message: 'Seeding is disabled in production' });
    return;
  }
  await productsStore.forceSeed();
  res.json({ message: 'Products seeded successfully' });
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const parsed = parseIdParam(req.params.id);
    if (!parsed.ok) {
      res.status(400).json({ message: parsed.message });
      return;
    }
    const product = await productsStore.getProductById(parsed.data);
    if (!product) {
      res.status(404).json({ message: 'Prodotto non trovato.' });
      return;
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});
