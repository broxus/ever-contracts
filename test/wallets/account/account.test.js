const logger = require('mocha-logger');
const utils = require('./../../utils');

const chai = require('chai');

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const { expect } = chai;


describe('Test Account wallet', async function() {
  this.timeout(100000);

  let alice, bob, aliceKey, bobKey;

  describe('Setup accounts', async () => {
    it('Deploy Alice account', async () => {
      const Account = await locklift.factory.getAccount('Account');
  
      [aliceKey] = await locklift.keys.getKeyPairs();
  
      alice = await locklift.giver.deployContract({
        contract: Account,
        keyPair: aliceKey
      }, locklift.utils.convertCrystal(5, 'nano'));
  
      alice.setKeyPair(aliceKey);
      alice.afterRun = utils.afterRun;
  
      logger.log(`Alice: ${alice.address}`);
    });

    it('Deploy Bob account', async () => {
      const Account = await locklift.factory.getAccount('Account');
  
      [,bobKey] = await locklift.keys.getKeyPairs();

      bob = await locklift.giver.deployContract({
        contract: Account,
        keyPair: bobKey
      }, locklift.utils.convertCrystal(5, 'nano'));
  
      bob.setKeyPair(bobKey);
      bob.afterRun = utils.afterRun;
  
      logger.log(`Bob: ${bob.address}`);
    });
  });

  describe('Test wallet', async () => {
    it('Send 1 TON with correct key', async () => {
      await alice.runTarget({
        contract: bob,
        value: locklift.utils.convertCrystal(1, 'nano')
      });
      
      const aliceBalance = await locklift.ton.getBalance(alice.address);
      const bobBalance = await locklift.ton.getBalance(bob.address);
      
      logger.log(`Alice balance: ${locklift.utils.convertCrystal(aliceBalance, 'ton')}`);
      logger.log(`Bob balance: ${locklift.utils.convertCrystal(bobBalance, 'ton')}`);
      
      expect(aliceBalance.toNumber())
        .to.be.below(
          parseInt(locklift.utils.convertCrystal('4', 'nano')),
          'Too high Alice balance after send',
        );
  
      expect(bobBalance.toNumber())
        .to.be.above(
          parseInt(locklift.utils.convertCrystal('5.9', 'nano')),
          'Too low Bob balance after receive',
        );
    });
  
    it('Send TONs with incorrect key', async () => {
      const [,,wrongKey] = await locklift.keys.getKeyPairs();
      
      alice.setKeyPair(wrongKey);
  
      await expect(
        alice.runTarget({
          contract: bob,
          value: locklift.utils.convertCrystal(1, 'nano')
        })
      ).to.eventually.be.rejectedWith('exit code: 1101');
    });
  });
});
