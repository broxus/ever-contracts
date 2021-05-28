pragma ton-solidity ^0.39.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;


contract Giver {
    uint static public owner;

    constructor() public {
        require(tvm.pubkey() == msg.pubkey(), 101);
        tvm.accept();
    }

    function sendGrams(address dest, uint64 amount) public view {
        require(msg.pubkey() == owner, 101);
        require(address(this).balance > amount, 102);
        tvm.accept();

        dest.transfer(amount, false, 1);
    }
}
