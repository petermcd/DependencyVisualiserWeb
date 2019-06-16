## Dependency Visualiser Web

This ia very early stage demo of an output driver for
my [Dependency Visualiser](https://github.com/petermcd/Dependency-Visualiser)
project. This currently utilises a driver for Neo4J and accompanies the
[Neo4J storage driver](https://github.com/petermcd/DependencyVisualiserNeo4j).

This project is far from finished and contains some known bugs.

### What Next

A decision has to be made whether this project should have drivers for
different sources or simply use ajax and the main project driver is used.

This mean that the same code base could be used for the web component
regardless of database however it may increase server load and delays
in outputting the graph. 