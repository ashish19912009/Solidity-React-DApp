// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

contract Validation{
    function checkUserNumberInput(uint _num) internal pure {
        require(_num > 0, "Number can't be smaller than 1");
        assert(_num < 100000000000000000000);
    }
    function checkUserStringInput(string memory _val) internal pure{
        // check if user its input
        bytes memory str = bytes (_val);
        require(str.length > 5, "lottery name should be of atleast 5 characters.");
        require(str.length < 30, "lottery name shouldn't be more than 30 characters.");
        for(uint i = 0; i< str.length; i++) {
            
            bytes1 char = str[i];
            require((char >= 0x30 && char <= 0x39)  || 
                (char >= 0x41 && char <= 0x5A)  ||
                (char >= 0x61 && char <= 0x7A)  ||
                (char == 0x5F) || (char == 0x20), "String contains invalid character, character should be within [0-9] [A-Z] [a-z] and [_] only");
        }
    }
    
}