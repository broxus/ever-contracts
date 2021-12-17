const utils = require("./../utils");

const { expect } = require('chai');


describe('Test loudspeaker', async function() {
    let loudspeaker;
    let owner;

    this.timeout(100000);

    it('Setup owner', async () => {
        const Account = await locklift.factory.getAccount('Account');

        const [keyPair] = await locklift.keys.getKeyPairs();

        owner = await locklift.giver.deployContract({
            contract: Account,
            keyPair,
        });

        owner.setKeyPair(keyPair);
        owner.afterRun = utils.afterRun;
    });

    it('Setup loudspeaker', async () => {
        const LoudSpeaker = await locklift.factory.getContract('LoudSpeaker');

        loudspeaker = await locklift.giver.deployContract({
            contract: LoudSpeaker,
            constructorParams: {
                _owner: owner.address,
            },
        });
    });

    it('Test echo', async () => {
        await owner.runTarget({
            contract: loudspeaker,
            method: 'echo',
            params: {
                text: 'Hello world'
            }
        });

        const events = await loudspeaker.getEvents('Echo');

        expect(events)
            .to.have.lengthOf(1, 'Wrong amount of events');

        expect(events[0].value.text)
            .to.be.equal('Hello world', 'Wrong event text');
    });
});