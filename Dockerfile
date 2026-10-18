FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install || true
EXPOSE 8080
CMD ["node", "index.js"]
