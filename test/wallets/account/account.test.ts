import { AccountAbi } from '../../../build/factorySource';
import { Signer } from 'locklift';
import { Account, AccountFactory } from 'locklift/internal/factory';
import { expect } from 'chai';
import { Errors } from '../../errors';

describe('Test Account wallet', () => {
  let accountFactory: AccountFactory<AccountAbi>;
  let aliceSigner: Signer;
  let bobSigner: Signer;
  let wrongSigner: Signer;

  let alice: Account<AccountAbi>;
  let bob: Account<AccountAbi>;

  it('before', async () => {
    aliceSigner = await locklift.keystore.getSigner('0');
    bobSigner = await locklift.keystore.getSigner('1');
    wrongSigner = await locklift.keystore.getSigner('2');
    accountFactory = locklift.factory.getAccountsFactory('Account');
  });

  describe('Setup accounts', () => {
    it('Deploy Alice account', async () => {
      const { account } = await accountFactory.deployNewAccount({
        value: locklift.utils.toNano(5),
        publicKey: aliceSigner.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
      });

      alice = account;

      console.log(`Alice: ${alice.address}`);
    });

    it('Deploy Bob account', async () => {
      const { account } = await accountFactory.deployNewAccount({
        value: locklift.utils.toNano(5),
        publicKey: bobSigner.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
      });

      bob = account;

      console.log(`Bob: ${bob.address}`);
    });
  });

  describe('Test wallet', () => {
    it('Send 1 TON with correct key', async () => {
      await alice.accountContract.methods
        .sendTransaction({
          value: locklift.utils.toNano(1),
          payload: '',
          dest: bob.address,
          bounce: false,
          flags: 1,
        })
        .sendExternal({ publicKey: aliceSigner.publicKey });

      const aliceBalance = await locklift.provider.getBalance(alice.address);
      const bobBalance = await locklift.provider.getBalance(bob.address);

      console.log(`Alice balance: ${locklift.utils.fromNano(aliceBalance)}`);
      console.log(`Bob balance: ${locklift.utils.fromNano(bobBalance)}`);

      expect(+aliceBalance).to.be.below(
        +locklift.utils.toNano('4'),
        'Too high Alice balance after send',
      );
      return expect(+bobBalance).to.be.above(
        +locklift.utils.toNano('5.9'),
        'Too low Bob balance after receive',
      );
    });

    it('Send TONs with incorrect key', async () => {
      const code = await alice.accountContract.methods
        .sendTransaction({
          value: locklift.utils.toNano(1),
          payload: '',
          dest: bob.address,
          bounce: false,
          flags: 1,
        })
        .sendExternal({ publicKey: wrongSigner.publicKey })
        .then((res) => res.transaction.exitCode);

      return expect(code).to.be.eq(
        Errors.CALLER_IS_NOT_OWNER,
        'Transaction should be rejected with code 1101',
      );
    });
  });
});
