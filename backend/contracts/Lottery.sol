// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import './BaseLottery.sol';
import './Validation.sol';

contract Lottery is BaseLottery,Validation{

    struct ticket {
        uint16 looteryID;
        uint ticketPrice;
        uint ticketSerialNo;
    }

    struct participant{
        string name;
        uint8 age;
        uint64 mobile_no;
        bool isExists;
    }

    uint internal participantCount;

    mapping(uint => address) ticketOwner;
    mapping(address => participant) public allParticipants;
    mapping(address => ticket[]) public activeTickets;
    mapping(address => ticket[]) private completedTickets;
    mapping(address => uint) ticketCount;

    constructor() BaseLottery(msg.sender){}

    // can receive fund 
    receive() external payable {}
    function contractShouldBeUpAndRunning() internal view {
        require(contractState == CONTRACT_STATES.UP,"Contract is not active");
    }

    modifier checkIfUserAlreadyExist {
        require(allParticipants[msg.sender].isExists != true, "User Already associated with this address");
        _;
    }

    modifier shouldBeRegistered{
        require(allParticipants[msg.sender].age != 0,"Please register before entering game.");
        _;
    }

    function checkIfAlreadyInGame(uint16 _id) internal view {
        ticket[] memory tempTicket = activeTickets[msg.sender];
        for(uint i = 0; i<tempTicket.length; i++){
            require(tempTicket[i].looteryID != _id, "Already applied for this lottery");
        }
    }

    function canHaveMaxFiveActiveLottery() view internal {
        //  emit pDetails(activeTickets[msg.sender].length);
        require(activeTickets[msg.sender].length <= 5,"Can't have more than 5 active lottery at a time.");
    } 

    function addNewParticipant(string memory _name,uint8 _age, uint64 _mob_no) OnlyPraticipants checkIfUserAlreadyExist public {
        contractShouldBeUpAndRunning();
        participantCount++;
        // checkUserStringInput(_name);
        checkUserNumberInput(_age);
        checkUserNumberInput(_mob_no);
        allParticipants[msg.sender].name = _name;
        allParticipants[msg.sender].age = _age;
        allParticipants[msg.sender].mobile_no = _mob_no;
        allParticipants[msg.sender].isExists = true;
    }

    function buyLottery(uint16 _id) OnlyPraticipants shouldBeRegistered payable public {
        contractShouldBeUpAndRunning();
        canHaveMaxFiveActiveLottery();
        checkIfAlreadyInGame(_id);
        checkUserNumberInput(_id);
        checkIfLotteryOpen(_id);
        lottery storage temp = getLotteryDetails(_id);
        require(temp.ticketPrice == msg.value, "Please provide the exact amount to buy ticket");
        payable(this).transfer(msg.value);
        uint ticketSerialNo = updateLottery(_id);
        activeTickets[msg.sender].push(ticket(_id,msg.value,ticketSerialNo));
    }

    // get participant details
    function getParticipantDetails() public view returns(participant memory){
        contractShouldBeUpAndRunning();
        // participant memory temp;
        // temp.name = allParticipants[msg.sender].name;
        // temp.age = allParticipants[msg.sender].age;
        // temp.mobile_no = allParticipants[msg.sender].mobile_no;
        // return temp;
        return allParticipants[msg.sender];
    }

    function updateToActive(uint _id) internal{
        contractShouldBeUpAndRunning();
        allLottery[_id].status = active;
    }

}