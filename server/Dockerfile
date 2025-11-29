# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm i --only=production
COPY src ./src
ENV NODE_ENV=production PORT=5000
EXPOSE 5000
CMD ["node", "src/index.js"]
