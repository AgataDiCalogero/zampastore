import { Router } from 'express';
import { PRODUCTS } from '../mocks/products.data';

export const productsRouter = Router();

productsRouter.get('/', (_req, res) => {
  res.json(PRODUCTS);
});

productsRouter.get('/:id', (req, res) => {
  const product = PRODUCTS.find((item) => item.id === req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Prodotto non trovato' });
    return;
  }
  res.json(product);
});
