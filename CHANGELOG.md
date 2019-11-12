# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.2.0](https://github.com/decentralized-identity/element/compare/v0.0.2-2...v0.2.0) (2019-11-08)


### Bug Fixes

* fix resolver not working when there is a cache hit ([17021e6](https://github.com/decentralized-identity/element/commit/17021e6))
* **package:** fix bundle for core ([f34436f](https://github.com/decentralized-identity/element/commit/f34436f))
* add a default gas price of 100 GWei ([a65c1b5](https://github.com/decentralized-identity/element/commit/a65c1b5))
* add fromTransactionTime parameter in getTransactions ([247d49b](https://github.com/decentralized-identity/element/commit/247d49b))
* add omitTimestamp flag for resolver ([18eb7f9](https://github.com/decentralized-identity/element/commit/18eb7f9))
* add requirement for node 10 ([3e555e9](https://github.com/decentralized-identity/element/commit/3e555e9))
* add requirement for node 10 ([c2c6cd8](https://github.com/decentralized-identity/element/commit/c2c6cd8))
* await bug ([02974b4](https://github.com/decentralized-identity/element/commit/02974b4))
* fix badOperation ([8282df4](https://github.com/decentralized-identity/element/commit/8282df4))
* fix condition to determine when to use ElementMemoryAdapter ([da074ef](https://github.com/decentralized-identity/element/commit/da074ef))
* increment transactionTime ([4a4cfeb](https://github.com/decentralized-identity/element/commit/4a4cfeb))
* ipfs test ([da1b9fd](https://github.com/decentralized-identity/element/commit/da1b9fd))
* make sure to read ipfs if cache is empty ([672a558](https://github.com/decentralized-identity/element/commit/672a558))
* memory leak in snackbar ([f37e992](https://github.com/decentralized-identity/element/commit/f37e992))
* pin truffle-hdwallet-provider to 1.0.5 ([f355b00](https://github.com/decentralized-identity/element/commit/f355b00))
* proptype warning ([d3edbb9](https://github.com/decentralized-identity/element/commit/d3edbb9))
* remove networkChangedDetected variable ([a291f46](https://github.com/decentralized-identity/element/commit/a291f46))
* simplify ElementFirestoreAdapter constructor ([a3dc196](https://github.com/decentralized-identity/element/commit/a3dc196))
* stop using firebase and only rely on firebase-admin ([9908e0a](https://github.com/decentralized-identity/element/commit/9908e0a))
* storage manager test ([1d70d41](https://github.com/decentralized-identity/element/commit/1d70d41))
* test memory issue ([24c744a](https://github.com/decentralized-identity/element/commit/24c744a))
* test timeout ([ac34551](https://github.com/decentralized-identity/element/commit/ac34551))
* truffle test ([9e96ef7](https://github.com/decentralized-identity/element/commit/9e96ef7))
* **package:** remove tests from dist ([7b11c56](https://github.com/decentralized-identity/element/commit/7b11c56))
* update context to use a did spec that supports publicKeyHex ([91978b1](https://github.com/decentralized-identity/element/commit/91978b1))
* update name of firebase-adminsdk to be more generic ([2d959c4](https://github.com/decentralized-identity/element/commit/2d959c4))
* upgrade web3 version in app ([da1b6a4](https://github.com/decentralized-identity/element/commit/da1b6a4))
* upgrade web3 version in lib ([e9d0a5f](https://github.com/decentralized-identity/element/commit/e9d0a5f))
* use Promise API for web3.eth.getBlock ([7c06dd8](https://github.com/decentralized-identity/element/commit/7c06dd8))
* use rxdb on api ([c2348b8](https://github.com/decentralized-identity/element/commit/c2348b8))
* version of solc to avoid truffle build error ([7493e40](https://github.com/decentralized-identity/element/commit/7493e40))


### Features

* add storage manager ([c97a369](https://github.com/decentralized-identity/element/commit/c97a369))
* add transactionTimestamp ([a8a5291](https://github.com/decentralized-identity/element/commit/a8a5291))
* make storage manager retry interval configurable ([8087d16](https://github.com/decentralized-identity/element/commit/8087d16))
* replace pouchdb with rxdb for app db ([94e390b](https://github.com/decentralized-identity/element/commit/94e390b))