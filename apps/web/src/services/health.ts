import type { HealthResponse } from '@popcorn-time/shared';
import { getJson } from './http-client';
export const getHealth = () => getJson<HealthResponse>('/health');
