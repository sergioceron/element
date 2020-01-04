const { getTestSideTree, getLastOperation } = require('./test-utils');

const sidetree = getTestSideTree();
const element = require('../../index');

describe('DID Document model', () => {
  let primaryKey;
  let recoveryKey;
  let didUniqueSuffix;

  it('should support secp256k1 keys', async () => {
    primaryKey = await element.crypto.secp256k1.createKeys();
    recoveryKey = await element.crypto.secp256k1.createKeys();
    const didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey, recoveryKey.publicKey,
    );
    const createPayload = await sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    const txn = await sidetree.batchScheduler.writeNow(createPayload);
    expect(txn).toBeDefined();
    didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    const did = `did:elem:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument.id).toBe(did);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
  });

  it('should support adding a ed25519 key', async () => {
    const newKey = await element.crypto.ed25519.createKeys();
    const previousOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: previousOperation.didUniqueSuffix,
      previousOperationHash: previousOperation.operation.operationHash,
      patches: [
        {
          action: 'add-public-keys',
          publicKeys: [
            {
              id: '#newKey',
              usage: 'signing',
              type: 'Ed25519VerificationKey2018',
              publicKeyBase58: newKey.publicKeyBase58,
            },
          ],
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: '#primary',
      alg: 'ES256K',
    };
    const updatePayload = await sidetree.op.makeSignedOperation(
      header, payload, primaryKey.privateKey,
    );
    const updatePayload2 = await sidetree.op.getUpdatePayloadForAddingAKey(previousOperation, '#newKey', 'signing', newKey.publicKeyBase58, primaryKey.privateKey);
    const txn = await sidetree.batchScheduler.writeNow(updatePayload2);
    expect(txn).toBeDefined();
    const didDocument = await sidetree.resolve(didUniqueSuffix, true);
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
    expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
    expect(didDocument.publicKey[2].publicKeyBase58).toBe(newKey.publicKeyBase58);
  });

  // it('should support ed25519 keys', async () => {
  //   const primaryKey = await element.crypto.ed25519.createKeys();
  //   const recoveryKey = await element.crypto.ed25519.createKeys();
  //   const didDocumentModel = {
  //     '@context': 'https://w3id.org/did/v1',
  //     publicKey: [
  //       {
  //         id: '#primary',
  //         usage: 'signing',
  //         type: 'Ed25519VerificationKey2018',
  //         publicKeyBase58: primaryKey.publicKeyBase58,
  //       },
  //       {
  //         id: '#recovery',
  //         usage: 'recovery',
  //         type: 'Secp256k1VerificationKey2018',
  //         publicKeyBase58: recoveryKey.publicKeyBase58,
  //       },
  //     ],
  //   };
  //   const createPayload = await sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
  //   const txn = await sidetree.batchScheduler.writeNow(createPayload);
  //   expect(txn).toBeDefined();
  //   const didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
  //   const did = `did:elem:${didUniqueSuffix}`;
  //   const didDocument = await sidetree.resolve(did, true);
  //   expect(didDocument.id).toBe(did);
  //   expect(didDocument.publicKey[0].publicKeyHex).toBe(primaryKey.publicKey);
  //   expect(didDocument.publicKey[1].publicKeyHex).toBe(recoveryKey.publicKey);
  // });
});
