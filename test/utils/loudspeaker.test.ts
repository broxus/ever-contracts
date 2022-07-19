import { AccountAbi, LoudSpeakerAbi } from "../../build/factorySource";
import { Account, AccountFactory } from "locklift/build/factory/account";
import { Contract, Signer } from "locklift";
import { expect } from "chai";

describe("Test loudspeaker", async function () {
  let loudspeaker: Contract<LoudSpeakerAbi>;
  let owner: Account<AccountAbi>;
  let accountFactory: AccountFactory<AccountAbi>;
  let signer: Signer;

  it("before", async function () {
    signer = (await locklift.keystore.getSigner("0"))!;
    accountFactory = locklift.factory.getAccountsFactory("Account");
  });
  it("Setup owner", async () => {
    const { account } = await accountFactory.deployNewAccount({
      value: locklift.utils.toNano(3),
      publicKey: signer.publicKey,
      initParams: {
        _randomNonce: locklift.utils.getRandomNonce(),
      },
      constructorParams: {},
    });
    owner = account;
  });

  it("Setup loudspeaker", async () => {
    const { contract } = await locklift.factory.deployContract({
      contract: "LoudSpeaker",
      initParams: {
        _randomNonce: locklift.utils.getRandomNonce(),
      },
      constructorParams: {
        _owner: owner.address,
      },
      value: locklift.utils.toNano(2),
      publicKey: signer.publicKey,
    });
    loudspeaker = contract;
  });

  it("Test echo", async () => {
    await owner.runTarget(
      {
        contract: loudspeaker,
      },
      (targetContract: Contract<LoudSpeakerAbi>) => targetContract.methods.echo({ text: "Hello world" }),
    );
    const { events } = await loudspeaker.getPastEvents({ filter: event => event.event === "Echo" });
    expect(events).to.have.lengthOf(1, "Wrong amount of events");
    expect((events[0].data as { text: string }).text).to.be.equal("Hello world", "Wrong event text");
  });
});
