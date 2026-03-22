import { FastifyInstance } from 'fastify';
import { recordRequest } from '../metrics';

export function registerMetricsHook(fastify: FastifyInstance): void {
  fastify.addHook('onResponse', (request, reply, done) => {
    const route = `${request.method} ${request.routeOptions.url ?? request.url}`;
    const duration = Math.round(reply.elapsedTime);
    const isError = reply.statusCode >= 400;
    recordRequest(route, duration, isError);
    done();
  });
}
