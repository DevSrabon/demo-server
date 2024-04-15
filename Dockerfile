FROM node:21-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
EXPOSE 5000
CMD ["yarn", "start"]