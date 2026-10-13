FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build \
    && echo "=== COMPILED FILES ===" \
    && find /app/dist -maxdepth 3 -type f \
    && echo "=== ENTRY POINT CHECK ===" \
    && test -f /app/dist/index.js

EXPOSE 5000

CMD ["npm", "start"]