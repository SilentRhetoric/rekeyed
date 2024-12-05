import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { Config } from '@algorandfoundation/algokit-utils';
import { HelloWorldClient, HelloWorldFactory } from '../contracts/clients/HelloWorldClient';

const fixture = algorandFixture();
Config.configure({ populateAppCallResources: true });

let appClient: HelloWorldClient;

describe('HelloWorld', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { testAccount: firstAccount, generateAccount } = fixture.context;
    const { algorand } = fixture;

    const secondAccount = await generateAccount({ initialFunds: (100).algos() });

    console.debug('First account: ', firstAccount.addr.toString());
    console.debug('Second account: ', secondAccount.addr.toString());

    const rekeyResult = await algorand.send.payment({
      amount: (0).algos(),
      sender: firstAccount.addr,
      receiver: firstAccount.addr,
      rekeyTo: secondAccount.addr,
      note: 'Rekeying test account to second account',
    });
    // console.debug('Rekey result:', rekeyResult);

    const factory = new HelloWorldFactory({
      algorand,
      defaultSender: firstAccount.addr,
      defaultSigner: secondAccount.signer,
    });

    const createResult = await factory.send.create.createApplication();
    appClient = createResult.appClient;
  });

  // test('sum', async () => {
  //   const a = 13;
  //   const b = 37;
  //   const sum = await appClient.send.doMath({ args: { a, b, operation: 'sum' } });
  //   expect(sum.return).toBe(BigInt(a + b));
  // });

  // test('difference', async () => {
  //   const a = 13;
  //   const b = 37;
  //   const diff = await appClient.send.doMath({ args: { a, b, operation: 'difference' } });
  //   expect(diff.return).toBe(BigInt(a >= b ? a - b : b - a));
  // });

  test('hello', async () => {
    const hello = await appClient.send.hello({ args: { name: 'world!' } });
    expect(hello.return).toBe('Hello, world!');
  });
});
