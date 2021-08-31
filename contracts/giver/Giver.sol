pragma ton-solidity >= 0.39.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "../access/ExternalOwner.sol";
import "../utils/RandomNonce.sol";
import "../utils/CheckPubKey.sol";


/*
    @title Sample giver contract. Store TONs on the balance
    and send it on the owner's request
*/
contract Giver is ExternalOwner, RandomNonce, CheckPubKey {
    constructor(uint _owner) public checkPubKey {
        tvm.accept();

        setOwnership(_owner);
    }

    function sendGrams(address dest, uint64 amount) public view onlyOwner {
        tvm.accept();

        dest.transfer(amount, false, 1);
    }
}
