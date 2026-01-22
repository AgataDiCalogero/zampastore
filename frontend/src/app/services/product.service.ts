import { Injectable } from '@angular/core';
import { Product } from '@org/shared';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly products: Product[] = [
    {
      id: 'p-001',
      name: 'Crocchette Salmone & Riso 2kg',
      priceCents: 1899,
      imageUrl: 'https://placehold.co/600x600?text=ZampaStore+Crocchette',
    },
    {
      id: 'p-002',
      name: 'Snack Dentale Mini 200g',
      priceCents: 599,
      imageUrl: 'https://placehold.co/600x600?text=ZampaStore+Snack',
    },
    {
      id: 'p-003',
      name: 'Ciotola Inox Antiscivolo 900ml',
      priceCents: 899,
      imageUrl: 'https://placehold.co/600x600?text=ZampaStore+Ciotola',
    },
    {
      id: 'p-004',
      name: 'Guinzaglio Nylon Premium 120cm',
      priceCents: 1299,
      imageUrl: 'https://placehold.co/600x600?text=ZampaStore+Guinzaglio',
    },
    {
      id: 'p-005',
      name: 'Shampoo Delicato Pelo Lucido 250ml',
      priceCents: 1099,
      imageUrl: 'https://placehold.co/600x600?text=ZampaStore+Shampoo',
    },
    {
      id: 'p-006',
      name: 'Tiragraffi Compatto 50cm',
      priceCents: 2999,
      imageUrl: 'https://placehold.co/600x600?text=ZampaStore+Tiragraffi',
    },
  ];

  getProducts(): Observable<Product[]> {
    return of([...this.products]);
  }

  getProductById(id: string): Observable<Product | undefined> {
    const product = this.products.find((p) => p.id === id);
    return of(product);
  }
}
