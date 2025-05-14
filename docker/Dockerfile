FROM node:20-bullseye-slim AS base  

FROM base AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY tsconfig*.json ./
COPY prisma ./prisma
COPY .env ./
COPY swagger.yaml ./

RUN npx prisma generate
RUN npm run build

FROM base AS prod

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.yaml ./

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index"]
