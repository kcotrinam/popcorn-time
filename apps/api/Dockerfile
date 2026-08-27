FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
COPY packages/shared packages/shared
COPY packages/eslint-config packages/eslint-config
COPY packages/typescript-config packages/typescript-config
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
RUN pnpm --filter @popcorn-time/api prisma:generate && pnpm --filter @popcorn-time/api... build
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/packages/shared ./packages/shared
COPY --from=build --chown=app:app /app/apps/api ./apps/api
WORKDIR /app/apps/api
USER app
EXPOSE 3000
CMD ["node", "dist/server.js"]
