FROM node:20.15-alpine

WORKDIR /application

COPY package.json .
COPY package-lock.json .
RUN npm i --omit=dev

COPY . .

RUN npm run build

EXPOSE 8888

CMD ["npm", "run", "server"]
