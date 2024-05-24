# SGV Comunica

This is a query engine that wraps around [Comunica](https://github.com/comunica/comunica/).
This query engine is able to consume the Storage Guidance Vocabulary as proposed by Jitse De Smet in [his thesis](https://thesis.jitsedesmet.be/).
The complete thesis document can be found [online](https://thesis.jitsedesmet.be/solution/report.pdf).

This repository conatins both the [source code of the wrapper](/src) and the [benchmarking software](/benchmarking).
The benchmark assumes that a [SolidBench](https://github.com/SolidBench/SolidBench.js) server is running on `http://localhost:3000`.
Each pod should contain an SGV description of the data it contains.
In order to achieve this, we use a different [rdf-dataset-fragmenter](https://github.com/SolidBench/rdf-dataset-fragmenter.js) config.
The config can be found on [my GitHub repo](https://github.com/jitsedesmet/rdf-dataset-fragmenter.js/blob/feat/shaved-sgv/fragmenter-config-pod.json).

In order to achieve this, we use a different [rdf-dataset-fragmenter](https://github.com/SolidBench/rdf-dataset-fragmenter.js) implementation.
The custom implementation introduces a single, simple `fragmentationStrategy` called the [FragmentationStrategySGV](https://github.com/jitsedesmet/rdf-dataset-fragmenter.js/blob/feat/shaved-sgv/lib/strategy/FragmentationStrategySgv.ts).
A [different config](https://github.com/jitsedesmet/rdf-dataset-fragmenter.js/blob/feat/shaved-sgv/fragmenter-config-pod.json) is also required,
this config expects the SGV files that should be injected into the pod to be present at the same location as the config:
[1](https://github.com/jitsedesmet/rdf-dataset-fragmenter.js/blob/feat/shaved-sgv/sgv-posts-creationdate.ttl),
[2](https://github.com/jitsedesmet/rdf-dataset-fragmenter.js/blob/feat/shaved-sgv/sgv-posts-location.ttl),
[3](https://github.com/jitsedesmet/rdf-dataset-fragmenter.js/blob/feat/shaved-sgv/sgv-posts-one-file.ttl),
[4](https://github.com/jitsedesmet/rdf-dataset-fragmenter.js/blob/feat/shaved-sgv/sgv-posts-per-resource.ttl).


## Installation & Run

```bash
yarn install
yarn start
```

## Benchmarking

```bash
yarn bench
```
