FROM node:24-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 3000 5555
CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm run build

FROM node:24-alpine AS prod
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev --ignore-scripts && npx --yes prisma@5.22.0 generate
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "npx --yes prisma@5.22.0 migrate deploy && node dist/main.js"]
