import { Router } from 'express';
import { productsStore } from '../services/products.store';

export const productsRouter = Router();

productsRouter.get('/', async (_req, res) => {
  const products = await productsStore.listProducts();
  res.json(products);
});

productsRouter.get('/:id', async (req, res) => {
  const product = await productsStore.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Prodotto non trovato.' });
    return;
  }
  res.json(product);
});
