/* eslint-disable arrow-body-style */
const base64url = require('base64url');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const multihashes = require('multihashes');
// TODO: remove schema dependency
const schema = require('../schema');

// This function applies f, an async function, sequentially to an array of values
// We need it because:
//   - Promise.all executes all promises at the same time instead of sequentially
//   - for loop with await is very bad apparently
// Adapted from: https://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order
const executeSequentially = (f, array) => {
  return array
    .reduce((promise, value) => {
      return promise.then(() => f(value));
    }, Promise.resolve());
};

const encodeJson = payload => base64url.encode(Buffer.from(JSON.stringify(payload)));

const decodeJson = encodedPayload => JSON.parse(base64url.decode(encodedPayload));

const payloadToHash = (payload) => {
  const encodedPayload = encodeJson(payload);
  const encodedOperationPayloadBuffer = Buffer.from(encodedPayload);
  const hash = crypto
    .createHash('sha256')
    .update(encodedOperationPayloadBuffer)
    .digest();
  const hashAlgorithmName = multihashes.codes[18]; // 18 is code for sha256
  const multihash = multihashes.encode(hash, hashAlgorithmName);
  const encodedMultihash = base64url.encode(multihash);
  return encodedMultihash;
};

const getDidUniqueSuffix = (operation) => {
  const decodedPayload = decodeJson(operation.payload);
  const header = decodeJson(operation.protected);
  switch (header.operation) {
    case 'create':
      return payloadToHash(decodedPayload);
    case 'update':
    case 'recover':
    case 'delete':
      return decodedPayload.didUniqueSuffix;
    default:
      throw Error(`Cannot extract didUniqueSuffixe from: ${operation}`);
  }
};

const batchFileToOperations = batchFile => batchFile.operations.map((op) => {
  const decodedOperation = decodeJson(op);
  const operationHash = payloadToHash(decodedOperation.payload);
  const decodedOperationPayload = decodeJson(decodedOperation.payload);
  const decodedHeader = decodeJson(decodedOperation.protected);
  return {
    operationHash,
    decodedOperation,
    decodedOperationPayload,
    decodedHeader,
  };
});

const isTransactionValid = (transaction) => {
  const valid = schema.validator.isValid(transaction, schema.schemas.sidetreeTransaction);
  if (!valid) {
    throw new Error('transaction not valid', transaction);
  }
  return valid;
};

const isAnchorFileValid = (anchorFile) => {
  const valid = schema.validator.isValid(anchorFile, schema.schemas.sidetreeAnchorFile);
  if (!valid) {
    throw new Error('anchorFile not valid', anchorFile);
  }
  return valid;
};

const isBatchFileValid = (batchFile) => {
  const valid = schema.validator.isValid(batchFile, schema.schemas.sidetreeBatchFile);
  if (!valid) {
    throw new Error('batchFile not valid', batchFile);
  }
  return valid;
};

const syncTransaction = async (sidetree, transaction) => {
  try {
    isTransactionValid(transaction);
    const anchorFile = await sidetree.storage.read(transaction.anchorFileHash);
    isAnchorFileValid(anchorFile);
    const batchFile = await sidetree.storage.read(anchorFile.batchFileHash);
    isBatchFileValid(batchFile);
    const operations = batchFileToOperations(batchFile);
    const operationsByDidUniqueSuffixes = operations.map((operation) => {
      const didUniqueSuffix = getDidUniqueSuffix(operation.decodedOperation);
      return {
        type: didUniqueSuffix,
        didUniqueSuffix,
        transaction,
        operation,
      };
    });
    const writeOperationToCache = (op) => {
      const operationId = `operation:${op.operation.operationHash}${op.transaction.transactionTime}`;
      return sidetree.db.write(operationId, op);
    };
    return executeSequentially(
      writeOperationToCache,
      operationsByDidUniqueSuffixes,
    ).then(() => {
      return sidetree.db.write(`transaction:${transaction.transactionNumber}`, {
        type: 'transaction',
        ...transaction,
      });
    });
  } catch (error) {
    console.log(error);
    // https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
    const stringifiedError = JSON.stringify(
      error,
      Object.getOwnPropertyNames(error),
    );
    return sidetree.db.write(`transaction:${transaction.transactionNumber}`, {
      type: 'transaction',
      ...transaction,
      error: stringifiedError,
    });
  }
};

// TODO check is signatures are the same as sidetree's
const signEncodedPayload = (encodedHeader, encodedPayload, privateKey) => {
  const toBeSigned = `${encodedHeader}.${encodedPayload}`;
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeSigned))
    .digest();
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const signatureObject = secp256k1.sign(hash, privateKeyBuffer);
  const signature = base64url.encode(signatureObject.signature);
  return signature;
};

const verifyOperationSignature = (
  encodedHeader,
  encodedPayload,
  signature,
  publicKey,
) => {
  const toBeVerified = `${encodedHeader}.${encodedPayload}`;
  const hash = crypto
    .createHash('sha256')
    .update(Buffer.from(toBeVerified))
    .digest();
  const publicKeyBuffer = Buffer.from(publicKey, 'hex');
  return secp256k1.verify(hash, base64url.toBuffer(signature), publicKeyBuffer);
};


module.exports = {
  executeSequentially,
  encodeJson,
  decodeJson,
  payloadToHash,
  getDidUniqueSuffix,
  batchFileToOperations,
  syncTransaction,
  isTransactionValid,
  signEncodedPayload,
  verifyOperationSignature,
};