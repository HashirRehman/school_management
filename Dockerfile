FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy dependencies and application code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose port
EXPOSE 5111

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5111/api/auth/login', (r) => {process.exit(r.statusCode === 405 ? 0 : 1)})"

# Start application
CMD ["node", "app.js"]
