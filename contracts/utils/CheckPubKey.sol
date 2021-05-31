pragma ton-solidity ^0.39.0;


import "./../ErrorCodes.sol";


contract CheckPubKey {
    modifier checkPubKey() {
        require(msg.pubkey() == tvm.pubkey(), ErrorCodes.DIFFERENT_PUB_KEYS);
        _;
    }
}
