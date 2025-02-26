# SGV Comunica

[**DEMO VIDEO**]()

This is a query engine that wraps around [Comunica](https://github.com/comunica/comunica/).
This query engine is able to consume the Storage Guidance Vocabulary as proposed by Jitse De Smet in [his thesis](https://thesis.jitsedesmet.be/).
The complete thesis document can be found [online](https://thesis.jitsedesmet.be/solution/report.pdf).

This repository contains both the [source code of the wrapper](/src/lib/index.ts) and the [webapp](/src/routes).
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
