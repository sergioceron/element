const {
  didMethodName,
  getTestSideTree,
  getLastOperation,
} = require('../../__tests__/test-utils');
const { MnemonicKeySystem } = require('../../../index');

const sidetree = getTestSideTree();

jest.setTimeout(10 * 1000);

describe('json patch updates', () => {
  let mks;
  let primaryKey;
  let recoveryKey;
  let didDocumentModel;
  let createPayload;
  let didUniqueSuffix;

  const reset = async () => {
    mks = new MnemonicKeySystem(MnemonicKeySystem.generateMnemonic());
    primaryKey = mks.getKeyForPurpose('primary', 0);
    recoveryKey = mks.getKeyForPurpose('recovery', 0);
    didDocumentModel = sidetree.op.getDidDocumentModel(
      primaryKey.publicKey,
      recoveryKey.publicKey
    );
    createPayload = sidetree.op.getCreatePayload(didDocumentModel, primaryKey);
    didUniqueSuffix = sidetree.func.getDidUniqueSuffix(createPayload);
    await sidetree.batchScheduler.writeNow(createPayload);
  };

  const makeUpdate = async patches => {
    const lastOperation = await getLastOperation(sidetree, didUniqueSuffix);
    const payload = {
      didUniqueSuffix: lastOperation.didUniqueSuffix,
      previousOperationHash: lastOperation.operation.operationHash,
      patches: [
        {
          action: 'ietf-json-patch',
          patches,
        },
      ],
    };
    const header = {
      operation: 'update',
      kid: `${didMethodName}:${lastOperation.didUniqueSuffix}#primary`,
      alg: 'ES256K',
    };
    const sidetreeOp = await sidetree.op.makeSignedOperation(
      header,
      payload,
      primaryKey.privateKey
    );
    await sidetree.batchScheduler.writeNow(sidetreeOp);
  };

  it('should add a new key', async () => {
    await reset();
    const newKey = mks.getKeyForPurpose('primary', 1);
    const patches = [
      {
        op: 'add',
        path: '/publicKey/2',
        value: {
          id: `${didMethodName}:${didUniqueSuffix}#newKey`,
          usage: 'signing',
          type: 'Secp256k1VerificationKey2018',
          publicKeyHex: newKey.publicKey,
        },
      },
    ];
    await makeUpdate(patches);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.publicKey).toHaveLength(3);
    expect(didDocument.publicKey[2].publicKeyHex).toBe(newKey.publicKey);
    expect(didDocument.publicKey[2].controller).toBe(didDocument.id);
  });

  it('should remove a key', async () => {
    const patches = [
      {
        op: 'remove',
        path: '/publicKey/2',
      },
    ];
    await makeUpdate(patches);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.publicKey).toHaveLength(2);
  });

  it('should add a new service endpoint', async () => {
    const patches = [
      {
        op: 'add',
        path: '/service',
        value: [
          {
            id: '#endpoint1',
            type: 'UserServiceEndpoint',
            serviceEndpoint: 'https://example.com',
          },
        ],
      },
    ];
    await makeUpdate(patches);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.service).toHaveLength(1);
  });

  it('should remove a service endpoint', async () => {
    const patches = [
      {
        op: 'remove',
        path: '/service',
      },
    ];
    await makeUpdate(patches);
    const did = `${didMethodName}:${didUniqueSuffix}`;
    const didDocument = await sidetree.resolve(did, true);
    expect(didDocument).toBeDefined();
    expect(didDocument.service).not.toBeDefined();
  });
});