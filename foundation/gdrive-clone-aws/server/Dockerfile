# --- Build & run Express API ---
FROM node:20-alpine

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++ sqlite-libs

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]

