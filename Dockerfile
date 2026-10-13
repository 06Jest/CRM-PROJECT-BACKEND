FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && \
    echo "Checking compiled entry points..." && \
    ls -la /app/dist && \
    ls -la /app/dist/src || true

EXPOSE 5000

CMD ["npm", "start"]