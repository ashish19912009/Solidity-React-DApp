// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "./Lottery.sol";

contract OwnerLotteryControls is BaseLottery,Validation,Lottery{

    // created the below structure for testing purpose. Uncomment it when running test cases.
    // struct customLottery{
    //     uint lottery_ID;
    //     string lootName;
    //     uint startDateTime;
    //     uint endDateTime;
    //     uint drawDateTime;
    //     uint totalCollection;
    //     address firstWinner;
    //     address secondWinner;
    //     address thirdWinner;
    //     lotteryStatus status;
    // }

    /**
    Contract controls in the time of emergency.
     */
    function pauseTheContract() external {
        UpdateContractState(CONTRACT_STATES.PAUSED);
    }
    
    function resumeTheContract() external {
        UpdateContractState(CONTRACT_STATES.UP);
    }

    function stopAndDestoryTheContract() external {
        UpdateContractState(CONTRACT_STATES.STOPED);
    }
      
    function minimunTicketPrice(uint _tPrice) pure private {
        require(_tPrice >= 1 ether,"Ticket price should be at least 1 ether");
    }

    function checkIfOwnerAccount() external view returns(bool){
        if(msg.sender == owner){
            return true;
        } else {
            return false;
        }
    }

    function createNewLottery(string memory _name, uint _startDateTime, uint _endDateTime, uint _drawDateTime, uint _ticketPrice) MaximumFiveActiveLottery ContractShouldBeActive OnlyOwner public {
        contractShouldBeUpAndRunning();
        checkUserStringInput(_name);
        checkUserNumberInput(_startDateTime);
        checkUserNumberInput(_endDateTime);
        checkUserNumberInput(_drawDateTime);
        minimunTicketPrice(_ticketPrice);
        setLottery(_name, _startDateTime, _endDateTime, _drawDateTime, _ticketPrice);
    }

    function updateLotteryToActive(uint _id) OnlyOwner public{
        updateToActive(_id);
    }

    function endLottery(uint _id) ContractShouldBeActive OnlyOwner public {
        checkIfGameIsActive(_id);
        checkIfLotteryGameCanBeEnded(_id);
        checkEndedLotteryLength();
        lotteryStatus pending = lotteryStatus.PENDING_DRAW;
        updateLotteryStatus(_id, pending);
        
        for(uint i = 0; i < openLotteries.length; i++) {
            if(openLotteries[i] == _id) {
               openLotteries[i] =  openLotteries[openLotteries.length-1];
               endedLotteries.push(openLotteries[openLotteries.length-1]);
               delete openLotteries[openLotteries.length-1];
               break;
            }
        }
    }

    function lotteryLuckyDraw(uint _lotteryID) ContractShouldBeActive OnlyOwner public {
        uint[] memory winners = luckyDraw(_lotteryID);
        TransferMoneyToWinner(_lotteryID,winners);
    }

    function checkContactCurrentBalance() public view OnlyOwner returns(uint){
        return LotteryContractAccountBalance();
    }

    function TransferMoneyToWinner(uint _lotteryID,uint[] memory _winners) private { 
        contractShouldBeUpAndRunning();
        allPrizes memory prizeAmount = allLottery[_lotteryID].prizeAmount;
        uint totalAmountToBeAwarded = prizeAmount.firstPrize + prizeAmount.secondPrize + prizeAmount.thirdPrize;
        require(checkContactCurrentBalance() >= totalAmountToBeAwarded, "Fund not sufficent, terminating transfer");
        // First Winner operations
        address payable firstWinner = payable(allLottery[_lotteryID].ticketOwner[_winners[0]]);
        firstWinner.transfer(prizeAmount.firstPrize);
        
        // Second winner operations
        address payable secondWinner = payable(allLottery[_lotteryID].ticketOwner[_winners[1]]); 
        secondWinner.transfer(prizeAmount.secondPrize);
        
        // third winner operation
        address payable thirdWinner = payable(allLottery[_lotteryID].ticketOwner[_winners[2]]); 
        thirdWinner.transfer(prizeAmount.thirdPrize);
    }

    function getAllActiveLotteryArrayList() view public returns(uint[] memory) {
        return openLotteries;
    }

    function getAllEndedLotteryArrayList() view public returns(uint[] memory) {
        return endedLotteries;
    }

    // created the below structure for testing purpose. Uncomment it when running test cases.
    // function getLotteryDetail(uint lotteryID) public view returns(customLottery memory){
    //     lottery storage tempLottery = getLotteryDetails(lotteryID);
    //     customLottery memory newtempLottery;
    //     newtempLottery.lottery_ID = 123;
    //     newtempLottery.lootName = tempLottery.lootName;
    //     newtempLottery.startDateTime = tempLottery.startDateTime;
    //     newtempLottery.endDateTime = tempLottery.endDateTime;
    //     newtempLottery.drawDateTime = tempLottery.drawDateTime;
    //     newtempLottery.totalCollection = tempLottery.totalCollection;
    //     newtempLottery.status = tempLottery.status;
    //     newtempLottery.firstWinner = tempLottery.ticketOwner[tempLottery.winners.firstPrize];
    //     newtempLottery.secondWinner = tempLottery.ticketOwner[tempLottery.winners.secondPrize];
    //     newtempLottery.thirdWinner = tempLottery.ticketOwner[tempLottery.winners.thirdPrize];

    //     return newtempLottery;    
    // }

}