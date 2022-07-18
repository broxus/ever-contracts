import { Contract, Signer } from "locklift";
import { AccountAbi, GiverAbi } from "../../build/factorySource";
import { Account, AccountFactory } from "locklift/factory";
import { before } from "mocha";

const chai = require("chai");

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { expect } = chai;

describe("Test giver", async function () {
  let giver: Contract<GiverAbi>;
  let accountFactory: AccountFactory<AccountAbi>;
  let signer: Signer;
  it("before", async function () {
    signer = (await locklift.keystore.getSigner("0"))!;
    accountFactory = locklift.factory.getAccountsFactory("Account");
  });
  it("Deploy giver", async function () {
    const { contract } = await locklift.factory.deployContract({
      contract: "Giver",
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

  describe("Send funds", async function () {
    let receiver: Account<AccountAbi>;

    it("Setup receiver wallet", async function () {
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
    it("Use correct key", async function () {
      const initialBalance = await locklift.provider.getBalance(receiver.address);

      await giver.methods
        .sendGrams({ dest: receiver.address, amount: locklift.utils.toNano(1) })
        .sendExternal({ publicKey: signer.publicKey });

      const finalBalance = await locklift.provider.getBalance(receiver.address);

      expect(Number(finalBalance)).to.be.above(Number(initialBalance), "Receiver balance should increase");
    });
    it("Use wrong key", async function () {
      const wrongAddress = (await locklift.keystore.getSigner("19"))!;

      await expect(
        await giver.methods
          .sendGrams({ dest: receiver.address, amount: locklift.utils.toNano(1) })
          .sendExternal({ publicKey: wrongAddress.publicKey })
          .then(res => res.transaction.exitCode),
      ).to.be.equal(1101, "Should aborted with code 1101");
    });
  });
});
