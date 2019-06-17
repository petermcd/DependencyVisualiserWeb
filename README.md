## Dependency Visualiser Web

This ia very early stage demo of an output driver for
my [Dependency Visualiser](https://github.com/petermcd/Dependency-Visualiser)
project. This implementation is not reliant on any specific
storage mechanism and simply retrieves the data from an AJAX query.

This project is far from finished and contains some known bugs.

### TODO

* Currently not using locally installed packages. This is causing
latency issues
* look into using imports for including other javascript files to
improve overhead
* Investigate the use of websockets or server sent events to receive
data, this will help with larger databases