import { Router } from 'express';
import { productsStore } from '../services/products.store';
import { parseIdParam } from '../services/params.validation';

export const productsRouter = Router();

productsRouter.get('/', async (_req, res) => {
  const products = await productsStore.listProducts();
  res.json(products);
});

productsRouter.get('/:id', async (req, res) => {
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
});
