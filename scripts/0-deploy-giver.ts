const logger = require("mocha-logger");

async function main() {
  const keyPair = (await locklift.keystore.getSigner("0"))!;

  const { contract, tx } = await locklift.factory.deployContract({
    contract: "Giver",
    publicKey: keyPair.publicKey,
    value: locklift.utils.toNano(1),
    constructorParams: {
      _owner: `0x${keyPair.publicKey}`,
    },
    initParams: {
      _randomNonce: locklift.utils.getRandomNonce(),
    },
  });

  logger.success(`Giver: ${contract.address}`);
  logger.success(`Giver private key: ${JSON.stringify(keyPair)}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
