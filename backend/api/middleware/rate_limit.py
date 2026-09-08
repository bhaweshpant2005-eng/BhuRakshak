from collections import defaultdict, deque
from time import monotonic
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class InMemoryRateLimitMiddleware(BaseHTTPMiddleware):
    """Small prototype limiter; replace with Redis-backed shared limiting in a scaled deployment."""
    def __init__(self, app, max_requests: int, window_seconds: int):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.visits: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        if request.url.path in {"/docs", "/openapi.json", "/api/v1/health"}:
            return await call_next(request)
        now = monotonic()
        client = request.client.host if request.client else "unknown"
        entries = self.visits[client]
        while entries and entries[0] <= now - self.window_seconds:
            entries.popleft()
        if len(entries) >= self.max_requests:
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded. Please retry shortly."})
        entries.append(now)
        return await call_next(request)
