# production
FROM mcr.microsoft.com/playwright:v1.47.0-jamm

WORKDIR /app

COPY packag*.json ./
RUN npm install

copy . .

RUN npm build

EXPOSE 3000

CMD ["node", "dist/main.js"]
