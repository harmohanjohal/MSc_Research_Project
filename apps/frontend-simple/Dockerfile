# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Copy full application code
COPY . .

# Build arguments for Next.js public variables (needed at build time)
ARG NEXT_PUBLIC_WEATHER_API_KEY
ARG NEXT_PUBLIC_WEATHER_LOCATION
ENV NEXT_PUBLIC_WEATHER_API_KEY=$NEXT_PUBLIC_WEATHER_API_KEY
ENV NEXT_PUBLIC_WEATHER_LOCATION=$NEXT_PUBLIC_WEATHER_LOCATION

# Build the Next.js application
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files from the builder stage
# For standalone output (requires output: 'standalone' in next.config.mjs if used)
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public

# Since we might not have `output: 'standalone'` enabled, we copy dependencies and build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
