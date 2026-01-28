import swaggerJSDoc from 'swagger-jsdoc';

export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ZampaStore API',
      version: '0.1.0',
      description: 'API for ZampaStore (Express + Nx monorepo)',
    },
    servers: [{ url: '/api' }],
    tags: [
      { name: 'health' },
      { name: 'products' },
      { name: 'auth' },
      { name: 'orders' },
      { name: 'payments' },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'zs_session',
          description: 'HttpOnly session cookie',
        },
        csrfHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-csrf-token',
          description: 'CSRF token header',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['id', 'name', 'priceCents'],
          properties: {
            id: { type: 'string', example: 'prod-001' },
            name: { type: 'string', example: 'Crocchette premium pollo' },
            priceCents: { type: 'number', example: 1899 },
            imageUrl: {
              type: 'string',
              example:
                'https://images.unsplash.com/photo-1558944351-cf3c1b79f2c4',
            },
          },
        },
        AuthUser: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: { type: 'string', example: 'user-001' },
            email: { type: 'string', example: 'demo@zampastore.it' },
            name: { type: 'string', example: 'Demo Utente' },
          },
        },
        AuthResponse: {
          type: 'object',
          required: ['user'],
          properties: {
            user: { $ref: '#/components/schemas/AuthUser' },
            token: { type: 'string', nullable: true },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'demo@zampastore.it' },
            password: { type: 'string', example: 'Demo123!' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', example: 'Demo Utente' },
            email: { type: 'string', example: 'demo@zampastore.it' },
            password: { type: 'string', example: 'Demo123!' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        HealthResponse: {
          type: 'object',
          required: ['ok', 'db', 'latencyMs'],
          properties: {
            ok: { type: 'boolean', example: true },
            db: { type: 'string', example: 'ok' },
            latencyMs: { type: 'number', example: 12 },
            uptimeMs: { type: 'number', example: 4521 },
          },
        },
        OrderStatus: {
          type: 'string',
          enum: [
            'pending',
            'paid',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
          ],
        },
        Order: {
          type: 'object',
          required: ['id', 'totalCents', 'createdAt', 'status'],
          properties: {
            id: { type: 'string', example: 'ord-123' },
            totalCents: { type: 'number', example: 4590 },
            createdAt: {
              type: 'string',
              example: '2026-01-26T12:00:00.000Z',
            },
            status: { $ref: '#/components/schemas/OrderStatus' },
          },
        },
        OrderLine: {
          type: 'object',
          required: [
            'productId',
            'name',
            'unitPriceCents',
            'qty',
            'lineTotalCents',
          ],
          properties: {
            productId: { type: 'string', example: 'prod-001' },
            name: { type: 'string', example: 'Crocchette premium pollo' },
            unitPriceCents: { type: 'number', example: 1899 },
            qty: { type: 'number', example: 2 },
            lineTotalCents: { type: 'number', example: 3798 },
          },
        },
        ShippingAddress: {
          type: 'object',
          required: ['firstName', 'lastName', 'address', 'city', 'postalCode'],
          properties: {
            firstName: { type: 'string', example: 'Agata' },
            lastName: { type: 'string', example: 'Di Calogero' },
            address: { type: 'string', example: 'Via Roma 1' },
            city: { type: 'string', example: 'Milano' },
            postalCode: { type: 'string', example: '20100' },
            country: { type: 'string', example: 'Italia' },
          },
        },
        OrderDetail: {
          allOf: [
            { $ref: '#/components/schemas/Order' },
            {
              type: 'object',
              required: ['items', 'shippingAddress'],
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/OrderLine' },
                },
                shippingAddress: {
                  $ref: '#/components/schemas/ShippingAddress',
                },
              },
            },
          ],
        },
        CartItem: {
          type: 'object',
          required: ['productId', 'qty'],
          properties: {
            productId: { type: 'string', example: 'prod-001' },
            qty: { type: 'number', example: 1 },
          },
        },
        CreateCheckoutSessionRequest: {
          type: 'object',
          required: ['items', 'shippingAddress'],
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CartItem' },
            },
            shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
          },
        },
        CreateCheckoutSessionResponse: {
          type: 'object',
          required: ['url', 'orderId'],
          properties: {
            url: { type: 'string', example: 'https://checkout.stripe.com' },
            orderId: { type: 'string', example: 'ord-123' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['health'],
          summary: 'Health check',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthResponse',
                  },
                },
              },
            },
            '503': {
              description: 'Database unavailable',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' },
                },
              },
            },
          },
        },
      },
      '/products': {
        get: {
          tags: ['products'],
          summary: 'List products',
          responses: {
            '200': {
              description: 'List of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
        },
      },
      '/products/{id}': {
        get: {
          tags: ['products'],
          summary: 'Get product by id',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Product',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' },
                },
              },
            },
            '404': {
              description: 'Not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['auth'],
          summary: 'Login and set HttpOnly session cookie',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Authenticated user',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['auth'],
          summary: 'Register and set HttpOnly session cookie',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Registered user',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '409': {
              description: 'Email already registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['auth'],
          summary: 'Get current user from session',
          security: [{ sessionCookie: [] }],
          responses: {
            '200': {
              description: 'Authenticated user',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['auth'],
          summary: 'Logout and clear session cookie',
          security: [{ sessionCookie: [] }, { csrfHeader: [] }],
          responses: {
            '204': { description: 'Logged out' },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/orders': {
        get: {
          tags: ['orders'],
          summary: 'List orders',
          security: [{ sessionCookie: [] }],
          responses: {
            '200': {
              description: 'Orders list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/orders/{id}': {
        get: {
          tags: ['orders'],
          summary: 'Get order detail',
          security: [{ sessionCookie: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Order detail',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/OrderDetail' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/payments/checkout-session': {
        post: {
          tags: ['payments'],
          summary: 'Create Stripe checkout session',
          security: [{ sessionCookie: [] }, { csrfHeader: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateCheckoutSessionRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Checkout session',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CreateCheckoutSessionResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
});
