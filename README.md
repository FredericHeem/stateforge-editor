
# Airbex WebSocket Client Library

[Airbex](https://airbex.net) is a cryptocurrency exchange with WebSocket API based technology to provide efficient communication between clients and the *Airbex* backend.

This package provides:
* a WebSocket javascript library in `lib/Airbex.js`
* a simple web application that uses this library,
* a set of mocha based test in the `test` directory

The documentation for the traditional REST API is available at [https://airbex.net/apidoc/](https://airbex.net/apidoc/)


## Badges

[![Build Status](https://travis-ci.org/FredericHeem/airbex-client.svg?branch=master)](https://travis-ci.org/FredericHeem/airbex-client)  [![Code Climate](https://codeclimate.com/github/FredericHeem/airbex-client/badges/gpa.svg)](https://codeclimate.com/github/FredericHeem/airbex-client)  [![Codeclimate Code Coverage](https://codeclimate.com/github/FredericHeem/airbex-client/badges/coverage.svg)](https://codeclimate.com/github/FredericHeem/airbex-client)  [![Coveralls Coverage Status](https://coveralls.io/repos/FredericHeem/airbex-client/badge.png?branch=master)](https://coveralls.io/r/FredericHeem/airbex-client?branch=master)


## Library

The Airbex WebSocket library can be used in the browser and under nodejs, thanks to [browserify](https://github.com/substack/node-browserify)

This library provides the following messages:

* markets: the summary of all markets: market id, base/quote currency, high, low, volume, last price.
* market depth: the depth of the given market, a.k.a the order book.
* currencies: all the currencies.
* balances: the balances for the various currencies.
* whoami: information about the user .

To find out how to use this library, the easiest way is to look at `test/testWebSocket.js`.

## Web application sample.

This web application is written in pure vanilla Javascript, is modular, is event based and follow the Model View Controller design.

To install the dependencies:

```
sudo npm install
```


To start the web application:

```
npm start
```

or 

```
grunt serve
```

This will automatically open your default browser at the url: http://localhost:9000

## Test

To run the test against the demo `Airbex` backend:
```
NODE_ENV=demo mocha
```

To run the test against the production `Airbex` backend:
```
NODE_ENV=prod mocha
```

To set the `apikey`, please edit the configuration files `test/config/config.demo.json` or `test/config/config.prod.json`