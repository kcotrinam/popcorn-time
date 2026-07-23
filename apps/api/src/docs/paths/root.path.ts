export const rootPath = {
  get: {
    tags: ['System'],
    summary: 'API root',
    description: 'Reports the API service status.',
    responses: {
      '200': {
        description: 'API is running',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                version: { type: 'string' },
                status: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};
