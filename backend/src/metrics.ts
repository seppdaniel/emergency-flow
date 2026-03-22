interface RouteMetric {
  count: number;
  totalMs: number;
  errors: number;
}

interface DecisionMetric {
  count: number;
  totalScore: number;
}

export interface MetricsSnapshot {
  uptime: number;
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  routes: Record<string, {
    count: number;
    avgResponseMs: number;
    errors: number;
  }>;
  decisionsByType: Record<string, {
    count: number;
    avgScore: number;
  }>;
  collectedAt: string;
}

const routeMetrics = new Map<string, RouteMetric>();
const decisionMetrics = new Map<string, DecisionMetric>();
let totalRequests = 0;
let totalErrors = 0;
const startTime = Date.now();

export function recordRequest(route: string, durationMs: number, isError: boolean): void {
  totalRequests++;
  
  if (isError) {
    totalErrors++;
  }

  const existing = routeMetrics.get(route) || { count: 0, totalMs: 0, errors: 0 };
  routeMetrics.set(route, {
    count: existing.count + 1,
    totalMs: existing.totalMs + durationMs,
    errors: existing.errors + (isError ? 1 : 0),
  });
}

export function recordDecision(emergencyType: string, score: number): void {
  const existing = decisionMetrics.get(emergencyType) || { count: 0, totalScore: 0 };
  decisionMetrics.set(emergencyType, {
    count: existing.count + 1,
    totalScore: existing.totalScore + score,
  });
}

export function getMetricsSnapshot(): MetricsSnapshot {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const errorRate = totalRequests > 0 
    ? `${((totalErrors / totalRequests) * 100).toFixed(2)}%` 
    : '0.00%';

  const routes: Record<string, { count: number; avgResponseMs: number; errors: number }> = {};
  routeMetrics.forEach((metric, route) => {
    routes[route] = {
      count: metric.count,
      avgResponseMs: Math.round(metric.totalMs / metric.count),
      errors: metric.errors,
    };
  });

  const decisionsByType: Record<string, { count: number; avgScore: number }> = {};
  decisionMetrics.forEach((metric, type) => {
    decisionsByType[type] = {
      count: metric.count,
      avgScore: Math.round(metric.totalScore / metric.count),
    };
  });

  return {
    uptime,
    totalRequests,
    totalErrors,
    errorRate,
    routes,
    decisionsByType,
    collectedAt: new Date().toISOString(),
  };
}
