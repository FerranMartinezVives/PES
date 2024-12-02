FROM node:latest

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

RUN npm run build

#RUN npm run migrate

COPY entrypoint.sh /usr/src/app/

RUN chmod +x /usr/src/app/entrypoint.sh

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

CMD [ "npm", "run", "start" ]
