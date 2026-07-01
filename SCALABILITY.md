# Scalability Notes

## 1. Redis Caching

**What to cache:**
- User sessions / refresh tokens (replace JWT blacklist with Redis-backed sessions)
- Frequent read queries: task lists for active users, user profile lookups
- Database query results with a TTL (e.g. 30s for task lists)

**Implementation:**
```ts
// Pseudocode — cache-aside pattern
const cached = await redis.get(`tasks:${userId}`);
if (cached) return JSON.parse(cached);
const tasks = await prisma.task.findMany(...);
await redis.setex(`tasks:${userId}`, 30, JSON.stringify(tasks));
```

**Cache invalidation:**
- Invalidate user's task cache on create/update/delete
- Use Redis Pub/Sub or a simple key prefix per user

## 2. Rate Limiting

**Strategy:** Token bucket or sliding window per IP / per user.

**Implementation with `express-rate-limit` + Redis:**
```ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: { success: false, message: 'Too many requests' },
});
```

**Per-endpoint limits:**
- Auth endpoints: 10 req/min (prevent brute force)
- Task CRUD: 60 req/min per user
- General: 100 req/min per IP

## 3. Horizontal Scaling

**Statelessness:**
- JWT tokens are self-contained — no server-side session store needed
- Store refresh tokens in Redis for revocation support
- All instances share the same Redis + PostgreSQL

**Load Balancer:**
- Use Nginx or AWS ALB in round-robin mode
- Stickiness not needed (stateless JWT auth)
- Health check endpoint (`GET /health`) for LB target group

**Database:**
- Read replicas for PostgreSQL with Prisma's connection pooling
- Write to primary, read from replicas for task list queries
- Connection pooling via PgBouncer for high concurrency

## 4. Microservices Breakdown

If the application outgrows a monolith, split into domain services:

```
┌─────────────────────────────────────────┐
│           API Gateway (Nginx/Kong)       │
├──────────┬──────────┬────────┬──────────┤
│ Auth     │ Task     │ User   │ Notification │
│ Service  │ Service  │ Service│ Service   │
├──────────┴──────────┴────────┴──────────┤
│         Message Queue (RabbitMQ/Kafka)   │
├──────────────────────────────────────────┤
│         Shared Data Layer                │
│  PostgreSQL (per service) + Redis Cache  │
└──────────────────────────────────────────┘
```

**Service boundaries:**
- **Auth Service** — register, login, token management, SSO
- **Task Service** — CRUD, filtering, assignment, status workflows
- **User Service** — profile, preferences, admin management
- **Notification Service** — email reminders for due tasks, webhook events

**Inter-service communication:**
- Synchronous: REST/HTTP for read queries (API Gateway routes)
- Asynchronous: events via message queue for side-effects (e.g. "task.created" → send notification)
- Each service owns its database schema; no direct cross-service DB queries

**Resilience:**
- Circuit breakers (Opossum/Resilience4j) for service-to-service calls
- Retry with exponential backoff + jitter
- Bulkhead isolation for critical vs. non-critical paths
- Distributed tracing (OpenTelemetry) across services

## 5. Other Considerations

| Concern           | Approach                                      |
|-------------------|-----------------------------------------------|
| File Storage      | S3/MinIO for attachments, presigned URLs      |
| Search            | PostgreSQL full-text search → Elasticsearch   |
| CORS & Security   | API Gateway manages CORS, WAF in front        |
| CI/CD             | Docker images per service, Kubernetes/EKS     |
| Monitoring        | Prometheus metrics, structured logging (JSON) |
| Async Jobs        | Bull/BullMQ with Redis for scheduled tasks    |
