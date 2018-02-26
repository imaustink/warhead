# warhead

The warhead project is a set of tools for building microservices atop Functions as a Service (FaaS) platforms.

Currently, warhead supports AWS Lambda, but the goal is to support as many platforms as possible.

## Install CLI

1. `npm i -g warhead`

## CLI Usage
The CLI will help you scaffold projects and their subsequent services, as well as test and deploy them.

```
Usage: warhead generate [type]

Options:

  -V, --version  output the version number
  -h, --help     output usage information


Commands:

  generate|g [type]  Run a generator. Type can be
    • project - Create a new warhead project in a subdirectory
    • service - Create a new warhead service in the current project
  
  test|t [name]      Run test for a service.
  deploy|d [name]    Deploy a service
```

## Adapters

[AWS Lambda](https://github.com/imaustink/warhead-lambda)
GCP Functions - not yet implemented
Azure Functions - not yet implemented
Firebase Functions - not yet implemented
