FROM node:24 AS build

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10.23.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


# ===== Production stage =====
FROM nginx:alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing support (important for TanStack Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80