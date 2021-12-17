pragma ton-solidity >= 0.39.0;


import './../access/InternalOwner.sol';
import './RandomNonce.sol';
import './CheckPubKey.sol';


contract LoudSpeaker is InternalOwner, RandomNonce, CheckPubKey {
    event Echo(string text);

    constructor(address _owner) public checkPubKey {
        tvm.accept();

        setOwnership(_owner);
    }

    function echo(string text) external onlyOwner {
        emit Echo(text);
    }
}