# SGV Comunica

This is a query engine that wraps around [Comunica](https://github.com/comunica/comunica/).
This query engine is able to consume the Storage Guidance Vocabulary as proposed by Jitse De Smet in [his thesis](https://thesis.jitsedesmet.be/).
The complete thesis document can be found [online](https://thesis.jitsedesmet.be/solution/report.pdf).

This repository contains both the [source code of the wrapper](/src) and the [benchmarking software](/benchmark).
The benchmark assumes that a [SolidBench](https://github.com/SolidBench/SolidBench.js) server is running on `http://localhost:3000`.
Each pod should contain an SGV description of the data it contains.
A Docker image is available to run the SolidBench server with SGV described pods.

## Step by Step

The first thing to is get a SolidBench server running with SGV described solid pods.
For ease of use, a dockerFile has been made available.

After running the SolidBench instance, you will see the pods being served at `http://localhost:3000/pods/`.

This benchmark now contains 4 different SGV fragmentation strategies, we additionally give an example pod for each strategy:
1. Sort by creation date: [pod 65](http://localhost:3000/pods/00000000000000000065/)
2. Sort by location: [pod 150](http://localhost:3000/pods/00000000000000000150/)
3. Group all posts together (idem for comments): [pod 94](http://localhost:3000/pods/00000000000000000094/)
4. Each post/ comment has their own HTTP-resource: [pod 143](http://localhost:3000/pods/00000000000000000143/)



## Installation & Run

```bash
yarn install
yarn start
```

## Benchmarking

```bash
yarn bench
```
