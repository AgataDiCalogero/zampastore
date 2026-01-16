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
    tags: [{ name: 'health' }],
  },
  apis: [], // da inserire quando si aggiungeranno le route
});
