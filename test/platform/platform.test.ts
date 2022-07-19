import * as chai from "chai";
import { Address, Contract, Signer } from "locklift";
import { PlatformDeployerAbi } from "../../build/factorySource";
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { expect } = chai;
const ZERO_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";
describe("Test platform", async function () {
  let platformDeployer: Contract<PlatformDeployerAbi>;
  let signerRoot: Signer;
  let signerNotRoot: Signer;
  it("before", async function () {
    signerRoot = (await locklift.keystore.getSigner("0"))!;
    signerNotRoot = (await locklift.keystore.getSigner("10"))!;
  });
  it("Deploy platformDeployer", async function () {
    const Platform = await locklift.factory.getContractArtifacts("Platform");
    const PlatformBasedContract = await locklift.factory.getContractArtifacts("TestPlatform");

    const { contract } = await locklift.factory.deployContract({
      contract: "PlatformDeployer",
      publicKey: signerRoot.publicKey,
      constructorParams: {
        _platformCode: Platform.code,
        _platformBasedImage: PlatformBasedContract.code,
      },
      initParams: {},
      value: locklift.utils.toNano(2),
    });
    platformDeployer = contract;
    console.log(`PlatformDeployer: ${platformDeployer.address}`);
  });

  describe("Deploy platform based contract", async function () {
    it("Deploy from correct root", async function () {
      const contractId = 1;
      const contractNotId = 2;
      const contractPlatformType = 3;
      await platformDeployer.methods
        .deployPlatformBased({ id: contractId, notId: contractNotId, platformType: contractPlatformType })
        .sendExternal({ publicKey: signerRoot.publicKey });

      const platformBasedContractAddress = await platformDeployer.methods
        .expectedAddress({ root: platformDeployer.address, id: contractId, platformType: contractPlatformType })
        .call();
      const platformBasedContract = locklift.factory.getDeployedContract(
        "TestPlatform",
        platformBasedContractAddress.value0,
      );

      console.log(`Deployed platform based contract: ${platformBasedContract.address}`);
      const currentId = await platformBasedContract.methods.id({}).call();
      const currentNotId = await platformBasedContract.methods.notId({}).call();
      const currentPlatformType = await platformBasedContract.methods.platformType({}).call();
      expect(Number(currentId.id)).to.be.equal(contractId, "Wrong initial data in deployed platform based contract");
      expect(Number(currentNotId.notId)).to.be.equal(
        contractNotId,
        "Wrong constructor params in deployed platform based contract",
      );
      expect(Number(currentPlatformType.platformType)).to.be.equal(contractPlatformType, "Wrong platform type");
    });

    it("Deploy from wrong root", async function () {
      let platformBasedContract;
      const contractId = 2;
      const contractNotId = 3;
      const contractPlatformType = 4;
      await locklift.transactions.waitFinalized(
        platformDeployer.methods
          .deployNotFromRoot({
            root: new Address(ZERO_ADDRESS),
            id: contractId,
            notId: contractNotId,
            platformType: contractPlatformType,
          })
          .sendExternal({ publicKey: signerRoot.publicKey }),
      );

      const platformBasedContractAddress = await platformDeployer.methods
        .expectedAddress({
          root: new Address(ZERO_ADDRESS),
          id: contractId,
          platformType: contractPlatformType,
        })
        .call();
      platformBasedContract = await locklift.factory.getDeployedContract(
        "TestPlatform",
        platformBasedContractAddress.value0,
      );
      console.log(`Bad deployed platform based contract: ${platformBasedContract.address}`);
      const platformState = await locklift.provider.getFullContractState({ address: platformBasedContract.address });
      expect(platformState.state).to.be.undefined;
    });
  });
});
