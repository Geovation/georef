FROM alpine:3.4

RUN echo 'http://dl-4.alpinelinux.org/alpine/edge/testing' >> /etc/apk/repositories
RUN apk add --no-cache gdal nodejs

COPY interface/*  /georef/interface/
COPY georef.js    /georef/
COPY package.json /georef/

RUN cd georef && npm install

EXPOSE 3030

CMD cd georef && node georef
