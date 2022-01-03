FROM node:10

RUN apt update

WORKDIR /myapp

COPY package*.json ./
COPY bin bin/
COPY public public/
COPY routes routes/
COPY views views/
COPY app.js ./


RUN npm install

ENTRYPOINT [ "npm" ]

CMD [ "start" ]
