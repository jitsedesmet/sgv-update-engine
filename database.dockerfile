#We start by generating the LDBC SNB dataset
FROM rubensworks/ldbc_snb_datagen:latest AS ldbc

RUN echo "ldbc.snb.datagen.generator.scaleFactor:snb.interactive.0.1" > params.ini && \
    echo "ldbc.snb.datagen.serializer.dynamicActivitySerializer:ldbc.snb.datagen.serializer.snb.turtle.TurtleDynamicActivitySerializer" >> params.ini && \
    echo "ldbc.snb.datagen.serializer.dynamicPersonSerializer:ldbc.snb.datagen.serializer.snb.turtle.TurtleDynamicPersonSerializer" >> params.ini && \
    echo "ldbc.snb.datagen.serializer.staticSerializer:ldbc.snb.datagen.serializer.snb.turtle.TurtleStaticSerializer" >> params.ini

RUN ./docker_run.sh

ENTRYPOINT ["tail", "-f", "/dev/null"]

FROM node:lts AS builder

WORKDIR /usr/src/app

# get the SolidBench.js code and install
RUN git clone https://github.com/SolidBench/SolidBench.js.git && \
    cd SolidBench.js && \
    git checkout 057f77167484379d0aee2e405c804e8743a087cf && \
    yarn install && \
    cd ..

# Get the rdf-dataset-fragmenter.js code, install, and make rady to link to SolidBench.js
RUN git clone https://github.com/jitsedesmet/rdf-dataset-fragmenter.js.git && \
    cd rdf-dataset-fragmenter.js && \
    git checkout feat/shaved-sgv && \
    yarn install && \
    yarn link && \
    cd ..


WORKDIR /usr/src/app/SolidBench.js

# Link the rdf-dataset-fragmenter.js code to SolidBench.js and build the bin file
RUN yarn link rdf-dataset-fragmenter && \
    yarn build


ARG BASE_URL_REPLACE="http:\/\/localhost:3000"
# https:\/\/sgf.demo.jitsedesmet.be\/css
ARG BASE_ESCAPED_URL_REPLACE="http%3A%2F%2Flocalhost%3A3000%2F"
# https%3A%2F%2Fsgf.demo.jitsedesmet.be%2Fcss
ARG BASE_CSS_FILE_LOCATION="http/localhost_3000/"
# https/sgf.demo.jitsedesmet.be/css/

# get the fragment config and out four different fragmentation strategies
RUN curl -s  'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/fragmenter-config-pod.json' \
      | sed "s/http:\/\/localhost:3000/$BASE_URL_REPLACE/" \
      | sed "s/http%3A%2F%2Flocalhost%3A3000/$BASE_ESCAPED_URL_REPLACE/" \
    > fragmenter-config-pod.json && \
    curl -s  'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-creationdate.ttl' \
      | sed "s/http:\/\/localhost:3000/$BASE_URL_REPLACE/" \
      | sed "s/http%3A%2F%2Flocalhost%3A3000/$BASE_ESCAPED_URL_REPLACE/" \
    > sgv-posts-creationdate.ttl && \
    curl -s  'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-location.ttl' \
      | sed "s/http:\/\/localhost:3000/$BASE_URL_REPLACE/" \
      | sed "s/http%3A%2F%2Flocalhost%3A3000/$BASE_ESCAPED_URL_REPLACE/" \
    > sgv-posts-location.ttl && \
    curl -s  'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-one-file.ttl' \
      | sed "s/http:\/\/localhost:3000/$BASE_URL_REPLACE/" \
      | sed "s/http%3A%2F%2Flocalhost%3A3000/$BASE_ESCAPED_URL_REPLACE/" \
    > sgv-posts-one-file.ttl && \
    curl -s  'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-per-resource.ttl' \
      | sed "s/http:\/\/localhost:3000/$BASE_URL_REPLACE/" \
      | sed "s/http%3A%2F%2Flocalhost%3A3000/$BASE_ESCAPED_URL_REPLACE/" \
    > sgv-posts-per-resource.ttl && \
    mkdir out-validate && mkdir out-validate-params

# Copy the LDBC SNB dataset to the SolidBench.js folder
COPY --from=ldbc /opt/ldbc_snb_datagen/out /usr/src/app/SolidBench.js/out-snb/

# Generate the fragments
RUN node bin/solidbench generate --fragmentConfig './fragmenter-config-pod.json'


RUN cd out-fragments/${BASE_CSS_FILE_LOCATION}pods/00000000000000000143/posts/ && \
    rm -r 10* 27* 48* 61* 68* 89*


FROM node:lts AS runner

WORKDIR /usr/src/app

RUN git clone https://github.com/SolidBench/SolidBench.js.git && \
    cd SolidBench.js && \
    git checkout 0af1cb7b537ecfa69d01522145b680763434dcc1 && \
    cat package.json && \
    yarn install && \
    yarn build

WORKDIR /usr/src/app/SolidBench.js

COPY --from=builder /usr/src/app/SolidBench.js/out-fragments/ /usr/src/app/SolidBench.js/out-fragments/

ENTRYPOINT ["node", "./bin/solidbench", "serve"]
