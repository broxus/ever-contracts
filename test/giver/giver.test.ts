import { Contract, Signer } from 'locklift';
import { AccountAbi, GiverAbi } from '../../build/factorySource';
import { expect } from 'chai';
import { Account, AccountFactory } from 'locklift/internal/factory';
import { Errors } from '../errors';

describe('Test giver', () => {
  let giver: Contract<GiverAbi>;
  let accountFactory: AccountFactory<AccountAbi>;
  let signer: Signer;

  it('before', async () => {
    signer = await locklift.keystore.getSigner('0');
    accountFactory = locklift.factory.getAccountsFactory('Account');
  });

  it('Deploy giver', async () => {
    const { contract } = await locklift.factory.deployContract({
      contract: 'Giver',
      value: locklift.utils.toNano(3),
      constructorParams: {
        _owner: `0x${signer.publicKey}`,
      },
      publicKey: signer.publicKey,
      initParams: {
        _randomNonce: locklift.utils.getRandomNonce(),
      },
    });

    giver = contract;
  });

  describe('Send funds', () => {
    let receiver: Account<AccountAbi>;

    it('Setup receiver wallet', async () => {
      const { account } = await accountFactory.deployNewAccount({
        value: locklift.utils.toNano(3),
        publicKey: signer.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
      });

      receiver = account;
    });

    it('Use correct key', async () => {
      const initialBalance = await locklift.provider.getBalance(
        receiver.address,
      );

      await giver.methods
        .sendGrams({ dest: receiver.address, amount: locklift.utils.toNano(1) })
        .sendExternal({ publicKey: signer.publicKey });

      const finalBalance = await locklift.provider.getBalance(receiver.address);

      expect(+finalBalance).to.be.above(
        +initialBalance,
        'Receiver balance should increase',
      );
    });

    it('Use wrong key', async () => {
      const wrongAddress = await locklift.keystore.getSigner('19');

      const code = await giver.methods
        .sendGrams({
          dest: receiver.address,
          amount: locklift.utils.toNano(1),
        })
        .sendExternal({ publicKey: wrongAddress.publicKey })
        .then((res) => res.transaction.exitCode);

      return expect(code).to.be.equal(
        Errors.CALLER_IS_NOT_OWNER,
        'Should aborted with code 1000',
      );
    });
  });
});
