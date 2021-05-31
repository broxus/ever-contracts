const logger = require('mocha-logger');
const utils = require('../utils');
const chai = require('chai');

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;


describe('Test giver', async function() {
  this.timeout(200000);

  let giver;

  it('Deploy giver', async function() {
    const Giver = await locklift.factory.getContract('Giver');

    const keyPair = await locklift.ton.client.crypto.generate_random_sign_keys();

    giver = await locklift.giver.deployContract({
      contract: Giver,
      constructorParams: {
        _owner: `0x${keyPair.public}`,
      },
      keyPair,
    }, locklift.utils.convertCrystal(3, 'nano'));

    giver.afterRun = utils.afterRun;
    giver.setKeyPair(keyPair);

    logger.log(`Giver: ${giver.address}`);
  });

  describe('Send funds', async function() {
    let receiver;

    it('Setup receiver wallet', async function() {
      const Account = await locklift.factory.getContract('Account');
      const keyPair = await locklift.ton.client.crypto.generate_random_sign_keys();

      receiver = await locklift.giver.deployContract({
        contract: Account,
        keyPair,
      });

      logger.log(`Receiver account: ${receiver.address}`);
    }, locklift.utils.convertCrystal(1, 'nano'));

    it('Use correct key', async function() {
      const initialBalance = await locklift.ton.getBalance(receiver.address);

      await giver.run({
        method: 'sendGrams',
        params: {
          dest: receiver.address,
          amount: locklift.utils.convertCrystal(1, 'nano'),
        }
      });

      const finalBalance = await locklift.ton.getBalance(receiver.address);

      expect(finalBalance.toNumber())
        .to.be.above(initialBalance.toNumber(), 'Receiver balance should increase');
    });

    it('Use wrong key', async function() {
      const wrongKey = await locklift.ton.client.crypto.generate_random_sign_keys();
      giver.setKeyPair(wrongKey);

      await expect(
        giver.run({
          method: 'sendGrams',
          params: {
            dest: receiver.address,
            amount: locklift.utils.convertCrystal(1, 'nano'),
          }
        })
      ).to.eventually.be.rejectedWith('exit code: 1101');
    });
  });
});
