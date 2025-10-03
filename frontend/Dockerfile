# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
# Adiciona "-- --host" para expor o servidor na rede
CMD ["npm", "run", "dev", "--", "--host"]