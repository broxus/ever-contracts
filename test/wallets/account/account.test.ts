import { Account, AccountFactory } from "locklift/build/factory/account";
import { AccountAbi } from "../../../build/factorySource";
import { before } from "mocha";
import { Signer } from "locklift";
import * as chai from "chai";
const logger = require("mocha-logger");
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const { expect } = chai;

describe("Test Account wallet", async function () {
  let accountFactory: AccountFactory<AccountAbi>;
  let aliceSigner: Signer;
  let bobSigner: Signer;
  let wrongSigner: Signer;

  let alice: Account<AccountAbi>, bob: Account<AccountAbi>;
  it("before", async function () {
    aliceSigner = (await locklift.keystore.getSigner("0"))!;
    bobSigner = (await locklift.keystore.getSigner("1"))!;
    wrongSigner = (await locklift.keystore.getSigner("2"))!;
    accountFactory = locklift.factory.getAccountsFactory("Account");
  });
  describe("Setup accounts", async () => {
    it("Deploy Alice account", async () => {
      const { account } = await accountFactory.deployNewAccount({
        value: locklift.utils.toNano(5),
        publicKey: aliceSigner.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
      });
      alice = account;
      logger.log(`Alice: ${alice.address}`);
    });

    it("Deploy Bob account", async () => {
      const { account } = await accountFactory.deployNewAccount({
        value: locklift.utils.toNano(5),
        publicKey: bobSigner.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
      });
      bob = account;
      logger.log(`Bob: ${bob.address}`);
    });
  });

  describe("Test wallet", async () => {
    it("Send 1 TON with correct key", async () => {
      await alice.accountContract.methods
        .sendTransaction({
          value: locklift.utils.toNano(1),
          payload: "",
          dest: bob.address,
          bounce: false,
          flags: 1,
        })
        .sendExternal({ publicKey: aliceSigner.publicKey });

      const aliceBalance = await locklift.provider.getBalance(alice.address);
      const bobBalance = await locklift.provider.getBalance(bob.address);

      logger.log(`Alice balance: ${locklift.utils.fromNano(aliceBalance)}`);
      logger.log(`Bob balance: ${locklift.utils.fromNano(bobBalance)}`);

      expect(Number(aliceBalance)).to.be.below(
        parseInt(locklift.utils.toNano("4")),
        "Too high Alice balance after send",
      );

      expect(Number(bobBalance)).to.be.above(
        parseInt(locklift.utils.toNano("5.9")),
        "Too low Bob balance after receive",
      );
    });

    it("Send TONs with incorrect key", async () => {
      expect(
        await alice.accountContract.methods
          .sendTransaction({
            value: locklift.utils.toNano(1),
            payload: "",
            dest: bob.address,
            bounce: false,
            flags: 1,
          })
          .sendExternal({ publicKey: wrongSigner.publicKey })
          .then(res => res.transaction.exitCode),
      ).to.be.eq(1101, "Transaction should be rejected with code 1101");
    });
  });
});
