FROM bloodred17/puppeteer-headed

COPY . /app
WORKDIR /app

RUN npm install
RUN npm install tslib
RUN node ./node_modules/puppeteer/install.mjs
RUN npm run build
RUN export NODE_TLS_REJECT_UNAUTHORIZED=0
EXPOSE 3000

CMD Xvfb :99 -screen 0 1024x768x16 & npm run start:prod
