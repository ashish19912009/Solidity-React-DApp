// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;


contract BaseLottery{

    enum lotteryStatus{
        INACTIVE,
        ACTIVE,
        PENDING_DRAW,
        COMPLETED
    }
    enum CONTRACT_STATES{
        UP,
        PAUSED,
        STOPED
    }

    struct allPrizes{
        uint firstPrize;
        uint secondPrize;
        uint thirdPrize;
    }

    struct lottery{
        uint lottery_ID;
        string lootName;
        uint startDateTime;
        uint endDateTime;
        uint drawDateTime;
        uint ticketPrice;
        uint totalCollection;
        uint ticketSerialNo;
        allPrizes winners;
        allPrizes prizeAmount;
        lotteryStatus status;
        mapping(uint => address) ticketOwner;
    }
    
    CONTRACT_STATES internal contractState = CONTRACT_STATES.STOPED;
    
    // Owner of the contract
    address internal owner;

    uint nounce = 1000;
    uint commissionEarned;
    uint private lotteryCount;

    mapping(uint => lottery) public allLottery;
    uint[] internal openLotteries;
    uint[] internal endedLotteries;

    lotteryStatus active = lotteryStatus.ACTIVE;
    event timers(uint drawnTimeStamp, uint blocktimeStamp);


    constructor(address _owner){
        owner = _owner;
        UpdateContractState(CONTRACT_STATES.UP);
    }

    modifier OnlyOwner {
        require(msg.sender == owner,"Only Owner is permitted");
        _;
    }

    modifier OnlyPraticipants {
        require(msg.sender != owner,"Owner of this lottery can't apply");
        _;
    }

    modifier ContractShouldBeActive{
        require(contractState == CONTRACT_STATES.UP, "Contract is not in active mode");
        _;
    }

    modifier MaximumFiveActiveLottery {
        require(openLotteries.length < 5, "Can have only 5 active lottery.");
        _;
    }

    function UpdateContractState(CONTRACT_STATES _newState) OnlyOwner internal {
      contractState = _newState;
      require(contractState != CONTRACT_STATES.STOPED,"Contract is destroyed.");
      if(_newState == CONTRACT_STATES.STOPED) {
        selfdestruct(payable(msg.sender));
      }   
    }

    function setLottery(string memory _name, uint _sDateT, uint _eDateT, uint _dDateT, uint _ticketPrice) OnlyOwner internal {
        lotteryCount++;
        lotteryStatus inactive = lotteryStatus.INACTIVE;

        allLottery[lotteryCount].lottery_ID = lotteryCount;
        allLottery[lotteryCount].lootName = _name;
        allLottery[lotteryCount].startDateTime = _sDateT;
        allLottery[lotteryCount].endDateTime = _eDateT;
        allLottery[lotteryCount].drawDateTime = _dDateT;
        allLottery[lotteryCount].ticketPrice = _ticketPrice;
        allLottery[lotteryCount].status = inactive;
        openLotteries.push(lotteryCount);
    }

    function updateLottery(uint _id) OnlyPraticipants internal returns(uint){
        allLottery[_id].totalCollection += msg.value;
        allLottery[_id].ticketSerialNo++;
        allLottery[_id].ticketOwner[allLottery[_id].ticketSerialNo] = msg.sender;
        return allLottery[_id].ticketSerialNo;
    }

    function getAllLotteryCount() internal view returns(uint) {
        return lotteryCount;
    }

    function getLotteryDetails(uint _id) view internal returns(lottery storage){
         return(allLottery[_id]);
    }

    function checkIfGameIsInactive(uint _id) view internal {
        lotteryStatus inactive = lotteryStatus.INACTIVE;
        require(allLottery[_id].status == inactive, "Lottery not even started yet.");
    }

    function checkIfGameIsActive(uint _id) view internal {
        require(allLottery[_id].status == active, "Lottery is not open.");
    }

    function checkIfGameIsCompleted(uint _id) view internal{
        lotteryStatus completed = lotteryStatus.COMPLETED;
        require(allLottery[_id].status == completed, "Lottery is not completed.");
    }

    function checkIfLotteryIsInPendingState(uint _id) view internal {
        lotteryStatus pending = lotteryStatus.PENDING_DRAW;
        require(allLottery[_id].status == pending, "Lottery can't be drawn for now.");
    }
 
    function checkIfLotteryOpen(uint _id) view internal {
        checkIfGameIsActive(_id);
        require(allLottery[_id].endDateTime > block.timestamp, "The lottery has expired");
    }

    function checkIfLotteryGameCanBeEnded(uint _id) view internal {
        require(allLottery[_id].endDateTime <= block.timestamp,"Time left to end the lottery");
    }

    function checkEndedLotteryLength() view internal {
        require(endedLotteries.length < 5, "There are lottries to be drawn.");
    }

    function checkIfLotteryGameCanBeDrawn(uint _id) view internal {
        require(allLottery[_id].drawDateTime <= block.timestamp,"Time left to draw the lottery");
    }

    function updateLotteryStatus(uint _id, lotteryStatus _status) internal {
        allLottery[_id].status = _status;
    }

    function selectRandowWinner(uint _lotteryID) private returns(uint){
        // uint[] memory _winners
        uint random = uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,nounce))) % allLottery[_lotteryID].ticketSerialNo;
        nounce++;
        return random;
    }

    function luckyDraw(uint _id) OnlyOwner internal returns(uint[] memory) {
        checkIfLotteryIsInPendingState(_id);
        checkIfLotteryGameCanBeDrawn(_id);
        lotteryStatus complete = lotteryStatus.COMPLETED;
        uint commission = (allLottery[_id].totalCollection / 100) * 5; // 5 % as commission to the contract owner;
        commissionEarned = commission;
        uint amtCol = allLottery[_id].totalCollection - commission;

        // First Prize - 40%, Second Prize - 35% and Third Prize - 25% 
        allPrizes memory prizeAmount = allPrizes((amtCol/100)*40,(amtCol/100)*35,(amtCol/100)*25);
        uint[] memory winnerTickets = new uint[](3);
        winnerTickets[0] = selectRandowWinner(_id);
        winnerTickets[1] = selectRandowWinner(_id);
        winnerTickets[2] = selectRandowWinner(_id);
        allPrizes memory winners = allPrizes(winnerTickets[0],winnerTickets[1],winnerTickets[2]);
        allLottery[_id].prizeAmount = prizeAmount;
        allLottery[_id].winners = winners;
        allLottery[_id].status = complete;
        return winnerTickets;
    }

    function LotteryContractAccountBalance() internal OnlyOwner view returns(uint) {
        return(address(this).balance);
    } 

// test functions
    // function updateContractToPaused() public OnlyOwner {
    //    // UpdateContractState(CONTRACT_STATES.UP);
    //     UpdateContractState(CONTRACT_STATES.PAUSED);
    // }

}