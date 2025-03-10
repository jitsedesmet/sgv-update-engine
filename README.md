# Storage Guiding Framework

[**DEMO VIDEO**](https://www.youtube.com/watch?v=4xJFaYyCSIg)  
[**DEMO SHORT**](https://www.youtube.com/shorts/cy2b7fKSsHs)

This repo contains a proof-of-concept implementation of the Storage Guiding Framework (SGF) as proposed by [Jitse De Smet](https://jitsedesmet.be/) in his [thesis](https://thesis.jitsedesmet.be/solution/report.pdf).
The implementation wraps around the [Comunica query engine](https://github.com/comunica/comunica/).
SGF is a collection of algorithms that consume the Storage Guidance Vocabulary (SGV) to guide the query engine.
A high level overview of SGF can be found in the accompanying [demo paper](https://sgv-demo-eswc-2025.jitsedesmet.be/).
For in detail description of SGF and SGV, please refer to [Chapter 5 of Jitse his thesis](https://thesis.jitsedesmet.be/solution/report.pdf#page=41).


This repository contains both the [source code of SGF engine](/src/lib/index.ts) and the [webapp](/src/routes)
used to demonstrate it.
The webapp assumes a [SolidBench](https://github.com/SolidBench/SolidBench.js) server with SGV enriched pods is running on `http://localhost:3000`.
For ease of use, we provide a [docker compose file](./docker-compose.yml) that starts both the required SolidBench server and the webapp.
The SolidBench server is available at `http://localhost:3000/pods/`, and the webapp is available at `http://localhost:3001/`.

## Running demo

You can run the demo using publicly available images by running the following command in this directory:

```bash
docker compose up
```

To build the images yourself, you will need to clone this repository and run the following commands:

```bash
git clone git@github.com:jitsedesmet/sgv-update-engine.git
cd sgv-update-engine
git checkout demo-eswc
docker compose up --build
```

Now open the webapp at `http://localhost:3001/`.
