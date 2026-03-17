FROM node:18-alpine AS base

WORKDIR /app

# Enable corepack for pnpm/yarn if needed, though this project uses npm
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build Next.js
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
RUN npm run build

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
