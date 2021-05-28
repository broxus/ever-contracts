pragma ton-solidity ^0.39.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;


contract InternalOwner {
    address public owner;

    event OwnershipTransferred(
        address previousOwner,
        address newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, 101);
        _;
    }

    /*
        @dev Internal function for setting owner
        Can be used in child contracts
    */
    function setOwnership(address newOwner) internal {
        owner = newOwner;
    }

    /*
        @dev Transfer ownership to the new owner
    */
    function transferOwnership(
        address newOwner
    ) external onlyOwner {
        require(newOwner != address.makeAddrStd(0, 0), 102);

        setOwnership(newOwner);

        emit OwnershipTransferred(owner, newOwner);
    }

    /*
        @dev Renounce ownership. Can't be aborted!
    */
    function renounceOwnership() external onlyOwner {
        address newOwner = address.makeAddrStd(0, 0);

        setOwnership(newOwner);

        emit OwnershipTransferred(owner, newOwner);
    }
}
