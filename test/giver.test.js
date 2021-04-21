const logger = require('mocha-logger');

// Since giver requires another giver to pay for deploy
// Giver is using itself
decribe('Test giver', async function() {
  let keyPair, giver;
  
  before(async function() {
    keyPair = await locklift.ton.client.generate_random_sign_keys();
  });
  
  it('Deploy giver', async function() {
    const Giver = await locklift.factory.getContract('Giver');
    
    giver = await locklift.giver.deployContract({
      contract: Giver,
      constructorParams: {},
      initParams: {
        owner: keyPair.public,
      },
      keyPair,
    });
    
    logger.log(`Giver: ${giver.address}`);
  });
  
  // describe('Send funds', async function() {
  //   it('Use correct key', async function() {
  //
  //   });
  //
  //   it('Use wrong key', async function() {
  //
  //   });
  // });
});
