import { Product } from '@zampa/shared';

export const PRODUCTS: Product[] = [
  // CIBO (6 items)
  {
    id: 'prod-001',
    name: 'Crocchette premium pollo',
    priceCents: 1899,
    description:
      'Ricetta bilanciata con ingredienti naturali e proteine di qualità.',
    imageUrl: '/assets/products/prod-001-crocchette-premium.jpg',
    images: [
      '/assets/products/prod-001-crocchette-premium.jpg',
      '/assets/products/prod-001-crocchette-premium-lifestyle.jpg',
    ],
    category: 'Cibo',
  },
  {
    id: 'prod-011',
    name: 'Paté al Salmone',
    priceCents: 250,
    description: 'Umido completo per gatti, ricco di Omega 3.',
    imageUrl: '/assets/products/prod-011-pate-salmone.jpg',
    images: [
      '/assets/products/prod-011-pate-salmone.jpg',
      '/assets/products/prod-011-pate-salmone-lifestyle.jpg',
    ],
    category: 'Cibo',
  },
  {
    id: 'prod-012',
    name: 'Biscotti Bio Pollo',
    priceCents: 450,
    description: 'Ricompensa sana e naturale per cani.',
    imageUrl: '/assets/products/prod-012-biscotti-bio.jpg',
    images: [
      '/assets/products/prod-012-biscotti-bio.jpg',
      '/assets/products/prod-012-biscotti-bio-lifestyle.jpg',
    ],
    category: 'Cibo',
  },
  {
    id: 'prod-013',
    name: 'Croccantini Puppy',
    priceCents: 2200,
    description: 'Per la crescita sana del tuo cucciolo.',
    imageUrl: '/assets/products/prod-013-croccantini-puppy.jpg',
    images: [
      '/assets/products/prod-013-croccantini-puppy.jpg',
      '/assets/products/prod-013-croccantini-puppy-lifestyle.jpg',
    ],
    category: 'Cibo',
  },
  {
    id: 'prod-014',
    name: 'Stick Masticabili',
    priceCents: 790,
    description: 'Aiuta a pulire i denti mentre diverte.',
    imageUrl: '/assets/products/prod-014-stick-masticabili.jpg',
    images: [
      '/assets/products/prod-014-stick-masticabili.jpg',
      '/assets/products/prod-014-stick-masticabili-lifestyle.jpg',
    ],
    category: 'Cibo',
  },
  {
    id: 'prod-010',
    name: 'Bocconcini di Manzo',
    priceCents: 350,
    description: 'Umido succulento per cani adulti.',
    imageUrl: '/assets/products/prod-010-bocconcini-manzo.jpg',
    images: [
      '/assets/products/prod-010-bocconcini-manzo.jpg',
      '/assets/products/prod-010-bocconcini-manzo-lifestyle.jpg',
    ],
    category: 'Cibo',
  },

  // CURA (6 items)
  {
    id: 'prod-002',
    name: 'Snack dentale alla menta',
    priceCents: 599,
    description: 'Snack funzionali per l’igiene orale quotidiana del tuo cane.',
    imageUrl: '/assets/products/prod-002-snack-menta.jpg',
    images: [
      '/assets/products/prod-002-snack-menta.jpg',
      '/assets/products/prod-002-snack-menta-lifestyle.jpg',
    ],
    category: 'Cura',
  },
  {
    id: 'prod-015',
    name: 'Shampoo Delicato',
    priceCents: 1250,
    description: 'Shampoo a pH neutro per manti sensibili.',
    imageUrl: '/assets/products/prod-015-shampoo-delicato.jpg',
    images: [
      '/assets/products/prod-015-shampoo-delicato.jpg',
      '/assets/products/prod-015-shampoo-delicato-lifestyle.jpg',
    ],
    category: 'Cura',
  },
  {
    id: 'prod-016',
    name: 'Spazzola Cardatore',
    priceCents: 1590,
    description: 'Rimuove il sottopelo morto senza graffiare.',
    imageUrl: '/assets/products/prod-016-spazzola-cardatore.jpg',
    images: [
      '/assets/products/prod-016-spazzola-cardatore.jpg',
      '/assets/products/prod-016-spazzola-cardatore-lifestyle.jpg',
    ],
    category: 'Cura',
  },
  {
    id: 'prod-017',
    name: 'Salviette Igienizzanti',
    priceCents: 490,
    description: 'Per pulire zampe e musetto al rientro.',
    imageUrl: '/assets/products/prod-017-salviette-igienizzanti.jpg',
    images: [
      '/assets/products/prod-017-salviette-igienizzanti.jpg',
      '/assets/products/prod-017-salviette-igienizzanti-lifestyle.jpg',
    ],
    category: 'Cura',
  },
  {
    id: 'prod-018',
    name: 'Antiparassitario Spray',
    priceCents: 2100,
    description: 'Protezione naturale contro pulci e zecche.',
    imageUrl: '/assets/products/prod-018-antiparassitario.jpg',
    images: [
      '/assets/products/prod-018-antiparassitario.jpg',
      '/assets/products/prod-018-antiparassitario-lifestyle.jpg',
    ],
    category: 'Cura',
  },
  {
    id: 'prod-009',
    name: 'Lettiera Silice',
    priceCents: 1490,
    description: 'Assorbente e antiodore a lunga durata.',
    imageUrl: '/assets/products/prod-009-lettiera-silice.jpg',
    images: [
      '/assets/products/prod-009-lettiera-silice.jpg',
      '/assets/products/prod-009-lettiera-silice-lifestyle.jpg',
    ],
    category: 'Cura',
  },

  // ACCESSORI (8 items)
  {
    id: 'prod-003',
    name: 'Pettorina comfort',
    priceCents: 2490,
    description:
      'Vestibilità ergonomica con imbottitura morbida e regolazioni rapide.',
    imageUrl: '/assets/products/prod-003-pettorina-comfort.jpg',
    images: [
      '/assets/products/prod-003-pettorina-comfort.jpg',
      '/assets/products/prod-003-pettorina-comfort-lifestyle.jpg',
    ],
    category: 'Accessori',
  },
  {
    id: 'prod-005',
    name: 'Cuscino relax',
    priceCents: 3490,
    description:
      'Cuscino ultra morbido per un riposo confortevole in ogni stagione.',
    imageUrl: '/assets/products/prod-005-cuscino-relax.jpg',
    images: [
      '/assets/products/prod-005-cuscino-relax.jpg',
      '/assets/products/prod-005-cuscino-relax-lifestyle.jpg',
    ],
    category: 'Accessori',
  },
  {
    id: 'prod-006',
    name: 'Ciotola slow-feed ergonomica',
    priceCents: 1590,
    description: 'Riduce l’ingestione rapida con design anti-ingozzamento.',
    imageUrl: '/assets/products/prod-006-ciotola-slow-feed.jpg',
    images: [
      '/assets/products/prod-006-ciotola-slow-feed.jpg',
      '/assets/products/prod-006-ciotola-slow-feed-lifestyle.jpg',
    ],
    category: 'Accessori',
  },
  {
    id: 'prod-019',
    name: 'Guinzaglio Retrattile',
    priceCents: 1850,
    description: 'Lunghezza 5m per massima libertà e controllo.',
    imageUrl: '/assets/products/prod-019-guinzaglio-retrattile.jpg',
    images: [
      '/assets/products/prod-019-guinzaglio-retrattile.jpg',
      '/assets/products/prod-019-guinzaglio-retrattile-lifestyle.jpg',
    ],
    category: 'Accessori',
  },
  {
    id: 'prod-020',
    name: 'Trasportino Rigido',
    priceCents: 4500,
    description: 'Sicuro per viaggi in auto e aereo.',
    imageUrl: '/assets/products/prod-020-trasportino-rigido.jpg',
    images: [
      '/assets/products/prod-020-trasportino-rigido.jpg',
      '/assets/products/prod-020-trasportino-rigido-lifestyle.jpg',
    ],
    category: 'Accessori',
  },
  {
    id: 'prod-021',
    name: 'Collare in Pelle',
    priceCents: 1990,
    description: 'Stile ed eleganza, resistente e morbido.',
    imageUrl: '/assets/products/prod-021-collare-pelle.jpg',
    images: [
      '/assets/products/prod-021-collare-pelle.jpg',
      '/assets/products/prod-021-collare-pelle-lifestyle.jpg',
    ],
    category: 'Accessori',
  },
  {
    id: 'prod-007',
    name: 'Ciotola Doppia Rialzata',
    priceCents: 2190,
    description: 'Design ergonomico per cibo e acqua.',
    imageUrl: '/assets/products/prod-007-ciotola-doppia.jpg',
    images: [
      '/assets/products/prod-007-ciotola-doppia.jpg',
      '/assets/products/prod-007-ciotola-doppia-lifestyle.jpg',
    ],
    category: 'Accessori',
  },
  {
    id: 'prod-008',
    name: 'Tiragraffi a Colonna',
    priceCents: 2990,
    description: 'In sisal naturale per la felicità del tuo gatto.',
    imageUrl: '/assets/products/prod-008-tiragraffi.jpg',
    images: [
      '/assets/products/prod-008-tiragraffi.jpg',
      '/assets/products/prod-008-tiragraffi-lifestyle.jpg',
    ],
    category: 'Accessori',
  },

  // GIOCHI (5 items)
  {
    id: 'prod-004',
    name: 'Gioco interattivo',
    priceCents: 1290,
    description:
      'Stimola mente e movimento con un gioco resistente e divertente.',
    imageUrl: '/assets/products/prod-004-gioco-interattivo.jpg',
    images: [
      '/assets/products/prod-004-gioco-interattivo.jpg',
      '/assets/products/prod-004-gioco-interattivo-lifestyle.jpg',
    ],
    category: 'Giochi',
  },
  {
    id: 'prod-022',
    name: 'Pallina Rimbalzante',
    priceCents: 350,
    description: 'Indistruttibile e galleggiante.',
    imageUrl: '/assets/products/prod-022-pallina-rimbalzante.jpg',
    images: [
      '/assets/products/prod-022-pallina-rimbalzante.jpg',
      '/assets/products/prod-022-pallina-rimbalzante-lifestyle.jpg',
    ],
    category: 'Giochi',
  },
  {
    id: 'prod-023',
    name: 'Corda da Tirare',
    priceCents: 890,
    description: 'Gioco in cotone naturale per la pulizia dentale.',
    imageUrl: '/assets/products/prod-023-corda-tirare.jpg',
    images: [
      '/assets/products/prod-023-corda-tirare.jpg',
      '/assets/products/prod-023-corda-tirare-lifestyle.jpg',
    ],
    category: 'Giochi',
  },
  {
    id: 'prod-024',
    name: 'Peluche Sonoro',
    priceCents: 990,
    description: 'Compagno di nanna con squeaker interno.',
    imageUrl: '/assets/products/prod-024-peluche-sonoro.jpg',
    images: [
      '/assets/products/prod-024-peluche-sonoro.jpg',
      '/assets/products/prod-024-peluche-sonoro-lifestyle.jpg',
    ],
    category: 'Giochi',
  },
  {
    id: 'prod-025',
    name: 'Tunnel Agility',
    priceCents: 2990,
    description: 'Per creare percorsi divertenti in giardino.',
    imageUrl: '/assets/products/prod-025-tunnel-agility.jpg',
    images: [
      '/assets/products/prod-025-tunnel-agility.jpg',
      '/assets/products/prod-025-tunnel-agility-lifestyle.jpg',
    ],
    category: 'Giochi',
  },
];
