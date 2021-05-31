pragma ton-solidity ^0.39.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./../ErrorCodes.sol";


contract ExternalOwner {
    uint public owner;

    event OwnershipTransferred(uint previousOwner, uint newOwner);

    modifier onlyOwner() {
        require(msg.pubkey() == owner, ErrorCodes.NOT_OWNER);
        _;
    }

    /*
        @dev Internal function for setting owner
        Can be used in child contracts
    */
    function setOwnership(uint newOwner) internal {
        uint oldOwner = owner;

        owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /*
        @dev Transfer ownership to the new owner
    */
    function transferOwnership(
        uint newOwner
    ) external onlyOwner {
        require(newOwner != 0, ErrorCodes.ZERO_OWNER);
        tvm.accept();

        setOwnership(newOwner);
    }
}
