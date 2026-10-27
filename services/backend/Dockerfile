FROM node:24-alpine AS base
RUN npm install -g pnpm@11.5.2
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY services/backend/package.json services/backend/
RUN pnpm install --frozen-lockfile --filter backend...
COPY services/backend services/backend
RUN pnpm --filter backend build

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY services/backend/package.json services/backend/
RUN pnpm install --frozen-lockfile --prod --filter backend...
COPY --from=build /app/services/backend/dist services/backend/dist
USER node
WORKDIR /app/services/backend
EXPOSE 3000
CMD ["node", "dist/index.js"]
