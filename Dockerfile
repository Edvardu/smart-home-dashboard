# ---- Build Step ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# ---- Serve Step ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
