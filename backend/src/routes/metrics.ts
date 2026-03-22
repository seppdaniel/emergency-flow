import { FastifyInstance } from 'fastify';
import { getMetricsSnapshot } from '../metrics';

export async function metricsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/metrics', async (request, reply) => {
    try {
      const snapshot = getMetricsSnapshot();
      return reply.status(200).send(snapshot);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
