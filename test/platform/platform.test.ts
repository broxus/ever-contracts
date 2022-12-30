import { Contract, Signer, zeroAddress } from 'locklift';
import { PlatformDeployerAbi } from '../../build/factorySource';
import { expect } from 'chai';

describe('Test platform', () => {
  let platformDeployer: Contract<PlatformDeployerAbi>;
  let signerRoot: Signer;

  it('before', async () => {
    signerRoot = await locklift.keystore.getSigner('0');
  });

  it('Deploy platformDeployer', async () => {
    const Platform = await locklift.factory.getContractArtifacts('Platform');
    const PlatformBasedContract = await locklift.factory.getContractArtifacts(
      'TestPlatform',
    );

    const { contract } = await locklift.factory.deployContract({
      contract: 'PlatformDeployer',
      publicKey: signerRoot.publicKey,
      constructorParams: {
        _platformCode: Platform.code,
        _platformBasedImage: PlatformBasedContract.code,
      },
      initParams: { _randomNonce: locklift.utils.getRandomNonce() },
      value: locklift.utils.toNano(2),
    });

    platformDeployer = contract;

    console.log(`PlatformDeployer: ${platformDeployer.address}`);
  });

  describe('Deploy platform based contract', () => {
    it('Deploy from correct root', async () => {
      const contractId = 1;
      const contractNotId = 2;
      const contractPlatformType = 3;

      await locklift.tracing.trace(
        platformDeployer.methods
          .deployPlatformBased({
            id: contractId,
            notId: contractNotId,
            platformType: contractPlatformType,
          })
          .sendExternal({ publicKey: signerRoot.publicKey }),
      );

      const platformBasedContractAddress = await platformDeployer.methods
        .expectedAddress({
          root: platformDeployer.address,
          id: contractId,
          platformType: contractPlatformType,
        })
        .call();

      const platformBasedContract = locklift.factory.getDeployedContract(
        'TestPlatform',
        platformBasedContractAddress.value0,
      );

      console.log(
        `Deployed platform based contract: ${platformBasedContract.address}`,
      );

      const currentId = await platformBasedContract.methods.id({}).call();
      const currentNotId = await platformBasedContract.methods.notId({}).call();
      const currentPlatformType = await platformBasedContract.methods
        .platformType({})
        .call();

      expect(+currentId.id).to.be.equal(
        contractId,
        'Wrong initial data in deployed platform based contract',
      );
      expect(+currentNotId.notId).to.be.equal(
        contractNotId,
        'Wrong constructor params in deployed platform based contract',
      );
      return expect(+currentPlatformType.platformType).to.be.equal(
        contractPlatformType,
        'Wrong platform type',
      );
    });

    it('Deploy from wrong root', async () => {
      const contractId = 2;
      const contractNotId = 3;
      const contractPlatformType = 4;

      await locklift.tracing.trace(
        platformDeployer.methods
          .deployNotFromRoot({
            root: zeroAddress,
            id: contractId,
            notId: contractNotId,
            platformType: contractPlatformType,
          })
          .sendExternal({ publicKey: signerRoot.publicKey }),
      );

      const platformBasedContractAddress = await platformDeployer.methods
        .expectedAddress({
          root: zeroAddress,
          id: contractId,
          platformType: contractPlatformType,
        })
        .call();

      const platformBasedContract = await locklift.factory.getDeployedContract(
        'TestPlatform',
        platformBasedContractAddress.value0,
      );

      console.log(
        `Bad deployed platform based contract: ${platformBasedContract.address}`,
      );

      const platformState = await locklift.provider.getFullContractState({
        address: platformBasedContract.address,
      });

      return expect(platformState.state).to.be.undefined;
    });
  });
});
