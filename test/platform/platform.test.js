const logger = require('mocha-logger');
const utils = require('../utils');
const chai = require('chai');

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const {expect} = chai;


describe('Test platform', async function () {
  this.timeout(200000);

  let platformDeployer;

  it('Deploy platformDeployer', async function () {
    const PlatformDeployer = await locklift.factory.getContract('PlatformDeployer');
    const Platform = await locklift.factory.getContract('Platform');
    const PlatformBasedContract = await locklift.factory.getContract('TestPlatform');

    const keyPair = await locklift.ton.client.crypto.generate_random_sign_keys();

    platformDeployer = await locklift.giver.deployContract({
      contract: PlatformDeployer,
      constructorParams: {
        _platformCode: Platform.code,
        _platformBasedImage: PlatformBasedContract.code
      },
      keyPair,
    }, locklift.utils.convertCrystal(2, 'nano'));

    platformDeployer.afterRun = utils.afterRun;
    platformDeployer.setKeyPair(keyPair);

    logger.log(`PlatformDeployer: ${platformDeployer.address}`);
  });

  describe('Deploy platform based contract', async function () {


    it('Deploy from correct root', async function () {
      let platformBasedContract;
      const contractId = 1;
      const contractNotId = 2;
      const contractPlatformType = 3;
      await platformDeployer.run({
        method: 'deployPlatformBased',
        params: {
          id: contractId,
          notId: contractNotId,
          platformType: contractPlatformType
        }
      });
      platformBasedContract = await locklift.factory.getContract('TestPlatform');
      platformBasedContract.setAddress(await platformDeployer.call({
        method: 'expectedAddress',
        params: {
          root: platformDeployer.address,
          id: contractId,
          platformType: contractPlatformType
        }
      }))

      logger.log(`Deployed platform based contract: ${platformBasedContract.address}`);
      const currentId = await platformBasedContract.call({method: 'id'});
      const currentNotId = await platformBasedContract.call({method: 'notId'});
      const currentPlatformType = await platformBasedContract.call({method: 'platformType'});
      expect(currentId.toNumber())
        .to.be.equal(contractId, 'Wrong initial data in deployed platform based contract');
      expect(currentNotId.toNumber())
        .to.be.equal(contractNotId, 'Wrong constructor params in deployed platform based contract');
      expect(currentPlatformType.toNumber())
        .to.be.equal(contractPlatformType, 'Wrong platform type');
    });

    it('Deploy from wrong root', async function () {
      let platformBasedContract;
      const contractId = 2;
      const contractNotId = 3;
      const contractPlatformType = 4;
      await platformDeployer.run({
        method: 'deployNotFromRoot',
        params: {
          root: locklift.ton.zero_address,
          id: contractId,
          notId: contractNotId,
          platformType: contractPlatformType
        }
      });
      platformBasedContract = await locklift.factory.getContract('TestPlatform');
      platformBasedContract.setAddress(await platformDeployer.call({
        method: 'expectedAddress',
        params: {
          root: locklift.ton.zero_address,
          id: contractId,
          platformType: contractPlatformType
        }
      }))
      logger.log(`Bad deployed platform based contract: ${platformBasedContract.address}`);
      const result = await locklift.ton.client.net.query_collection({
        collection: 'accounts',
        filter: {
          id: {eq: platformBasedContract.address},
        },
        result: 'acc_type'
      });
      expect(result.result.length).to.be.equal(0, 'Bad deployed platform is not empty');
    });
  });
});
