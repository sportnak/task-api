FROM node:9

RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential cmake gnutls-bin libgnutls28-dev uuid-dev && \
  curl -LO https://taskwarrior.org/download/task-2.5.1.tar.gz && \
  tar xzvf task-2.5.1.tar.gz && \
  cd task-2.5.1 && \
  cmake -DCMAKE_BUILD_TYPE=release . && \
  make install

RUN touch /root/.taskrc && \
  echo 'confirmation=no' >> /root/.taskrc

RUN mkdir /root/.task

COPY first_last.cert.pem /root/.task
COPY first_last.key.pem /root/.task
COPY ca.cert.pem /root/.task

RUN task config taskd.certificate -- ~/.task/first_last.cert.pem
RUN task config taskd.key         -- ~/.task/first_last.key.pem
RUN task config taskd.ca          -- ~/.task/ca.cert.pem
RUN task config taskd.server      -- noteable.me:53589
RUN task config taskd.credentials -- Public/First Last/c37e6448-282a-4911-8920-6a78b1a9a8c9
RUN task sync
RUN echo 'confirmation=yes' >> /root/.taskrc

RUN npm install -g -s --no-progress yarn && yarn --ignore-engines --ignore-scripts

ARG CACHEBUST=1
RUN echo $CACHEBUST
COPY ./ ./

EXPOSE 3000

CMD node index.js