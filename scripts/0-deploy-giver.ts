async function main() {
  const keyPair = await locklift.keystore.getSigner('0');

  const { contract } = await locklift.factory.deployContract({
    contract: 'Giver',
    publicKey: keyPair.publicKey,
    value: locklift.utils.toNano(1),
    constructorParams: {
      _owner: `0x${keyPair.publicKey}`,
    },
    initParams: {
      _randomNonce: locklift.utils.getRandomNonce(),
    },
  });

  console.log(`Giver: ${contract.address}`);
  console.log(`Giver private key: ${JSON.stringify(keyPair)}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
