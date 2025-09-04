# --- Build React app ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# --- Serve with Nginx + proxy /api to backend ---
FROM nginx:alpine
# Nginx site config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# Static files
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
