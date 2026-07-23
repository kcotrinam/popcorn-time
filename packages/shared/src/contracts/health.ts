export interface HealthResponse {
  status: 'ok' | 'error';
  services: { api: 'up' | 'down'; database: 'up' | 'down' };
  timestamp: string;
}
