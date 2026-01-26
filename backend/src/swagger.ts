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
    tags: [{ name: 'health' }, { name: 'products' }, { name: 'auth' }],
    components: {
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
                    type: 'object',
                    properties: { ok: { type: 'boolean', example: true } },
                  },
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
            '401': {
              description: 'Unauthorized',
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
            '409': {
              description: 'Email already registered',
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
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['auth'],
          summary: 'Logout and clear session cookie',
          responses: {
            '204': { description: 'Logged out' },
          },
        },
      },
    },
  },
  apis: [],
});
