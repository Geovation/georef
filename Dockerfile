FROM alpine:3.4

RUN echo 'http://dl-4.alpinelinux.org/alpine/edge/testing' >> /etc/apk/repositories
RUN apk add --no-cache gdal py-gdal proj4 python nodejs
RUN ln -s /usr/lib/libproj.so.0 /usr/lib/libproj.so

COPY interface/*  /georef/interface/
COPY georef.js    /georef/
COPY package.json /georef/
COPY config.json  /georef/

RUN cd georef && npm install

EXPOSE 3030

CMD cd georef && node georef
