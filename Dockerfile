FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

# Устанавливаем Chromium именно для версии Playwright в проекте
RUN npx playwright install --with-deps chromium

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 4000

CMD ["node", "dist/src/main.js"]