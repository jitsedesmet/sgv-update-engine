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

# get the fragment config and out four different fragmentation strategies
RUN wget 'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/fragmenter-config-pod.json' && \
    wget 'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-creationdate.ttl' && \
    wget 'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-location.ttl' && \
    wget 'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-one-file.ttl' && \
    wget 'https://raw.githubusercontent.com/jitsedesmet/rdf-dataset-fragmenter.js/refs/heads/feat/shaved-sgv/sgv-posts-per-resource.ttl'

# Copy the LDBC SNB dataset to the SolidBench.js folder
COPY --from=ldbc /opt/ldbc_snb_datagen/out /usr/src/app/SolidBench.js/out-snb/

# Generate the fragments
RUN node bin/solidbench generate --fragmentConfig './fragmenter-config-pod.json'

FROM node:lts AS runner

WORKDIR /usr/src/app

RUN git clone https://github.com/SolidBench/SolidBench.js.git && \
    cd SolidBench.js && \
    yarn install && \
    yarn build

WORKDIR /usr/src/app/SolidBench.js

COPY --from=builder /usr/src/app/SolidBench.js/out-fragments/ /usr/src/app/SolidBench.js/out-fragments/

#ENTRYPOINT ["tail", "-f", "/dev/null"]
CMD ["node", "./bin/solidbench", "serve"]

