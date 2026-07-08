# AN ACT backend — Reality Bridge ET-2
# Builds the Fastify API and runs the compiled dist/. Frontend is deployed
# separately (apps/web -> CDN). This image is the backend API tier only.

# ---- build stage ----
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Install deps against the real lockfile (root + workspaces).
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages ./packages
RUN npm ci --workspaces --include-workspace-root

# Compile TypeScript -> dist/ (pure tsc; no runtime esbuild needed).
COPY tsconfig.json ./
COPY src ./src
COPY database ./database
COPY scripts ./scripts
RUN npm run build

# Drop dev dependencies for a lean runtime image.
RUN npm prune --omit=dev

# ---- runtime stage ----
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/database ./database
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

# Container-level liveness; orchestrator should also gate traffic on GET /health.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.APP13_PORT||3000)+'/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
