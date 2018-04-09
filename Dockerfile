FROM node:8.10.0

WORKDIR /code

#Only required for debugging
RUN npm install -g nodemon yarn

COPY . /code

RUN yarn install

EXPOSE 8000

CMD ["npm", "start"]
