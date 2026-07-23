export const healthSchema = {
  type: 'object',
  required: ['status', 'services', 'timestamp'],
  properties: {
    status: { type: 'string', enum: ['ok', 'error'] },
    services: {
      type: 'object',
      properties: {
        api: { type: 'string', enum: ['up', 'down'] },
        database: { type: 'string', enum: ['up', 'down'] },
      },
    },
    timestamp: { type: 'string', format: 'date-time' },
  },
};
