const {expect, assert} = require('chai');
const { ethers } = require('hardhat');
const hre = require("hardhat");
const {loadFixture, time} = require("@nomicfoundation/hardhat-network-helpers");
const {expectRevert} = require("@openzeppelin/test-helpers");

describe("Test Lottery", function() {

    let lotteryInstance, signer;
    const playerOneInfo = {
        name: "Ashish",
        age: 31,
        mobile_no: 7088669991
    }

    async function deployLotteryFixture() {
        const Lottery = await hre.ethers.getContractFactory("Lottery");
        // get the chain accounts
        const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();
        // deploy the lottery contract
        lotteryInstance = await Lottery.deploy();
        lotteryInstance.deployed();
        // [signer] = await hre.ethers.provider.listAccounts();
        return {Lottery, lotteryInstance, owner, addr1, addr2, addr3, addr4, addr5, addr6};
    }

    // it('It should set the owner to be the deployer of the contract',async() => {
    //     const {owner,lotteryInstance, addr1} = await loadFixture(deployLotteryFixture);
    //     const t = await lotteryInstance.signer();
    //     console.log("tt",t);
    //     //assert.equal(await lotteryInstance.owner(), signer);
    // });

    describe("Add New Participants", function() {

        it('Contract should be up and Running', async () => {
            /*
            CONTRACT_STATES{
                UP     -> 0,
                PAUSED -> 1,
                STOPED -> 2
            }
            */
            const {lotteryInstance} = await loadFixture(deployLotteryFixture);
            const appCurrentState = await lotteryInstance.contractState();
            expect(appCurrentState).to.equal(0);
            // expect(appCurrentState).to.equal(lotteryArtifacts.CONTRACT_STATES.UP);
        });
    
        it('Should Add new Praticipants', async () => {
            const {lotteryInstance, addr1} = await loadFixture(deployLotteryFixture);
           
            await lotteryInstance.connect(addr1).addNewParticipant
            (playerOneInfo.name, playerOneInfo.age, playerOneInfo.mobile_no);
            const newData = await lotteryInstance.allParticipants(addr1.address);
            const pCount = await lotteryInstance.participantCount();
            expect(pCount).to.equal(1);
            expect(newData.isExists).to.equal(true);
            expect(newData.name).to.equal(playerOneInfo.name);
            expect(newData.age).to.equal(playerOneInfo.age);
            expect(newData.mobile_no).to.equal(playerOneInfo.mobile_no);
        }); 

        it('User details should be valid', async () => {
            const {lotteryInstance, addr1} = await loadFixture(deployLotteryFixture);
           
            await lotteryInstance.connect(addr1).addNewParticipant
            (playerOneInfo.name, playerOneInfo.age, playerOneInfo.mobile_no);
            const newData = await lotteryInstance.allParticipants(addr1.address);
            expect(newData.isExists).to.equal(true);
            expect(newData.name).to.equal(playerOneInfo.name);
        });

        it('User can get details', async () => {
            const {owner,lotteryInstance, addr1} = await loadFixture(deployLotteryFixture);
            await lotteryInstance.connect(addr1).addNewParticipant
            (playerOneInfo.name, playerOneInfo.age, playerOneInfo.mobile_no);
            
            const returnedData = await lotteryInstance.connect(addr1).getParticipantDetails();
            expect(returnedData.name).to.equal(playerOneInfo.name);
            expect(returnedData.age).to.equal(playerOneInfo.age);
            expect(returnedData.mobile_no).to.equal(playerOneInfo.mobile_no);
        }); 

        it("User can't have more than 5 active lottery at a time", async () => {
            const {lotteryInstance, addr1, addr2, addr3, addr4, addr5, addr6} = await loadFixture(deployLotteryFixture);
            //await lotteryInstance.connect(addr1).activeTickets[addr1].push({looteryID:1,ticketPrice:10,ticketSerialNo:20});
            //("PlayerName_1", 10, "1234567890");
            // await lotteryInstance.connect(addr1).addNewParticipant
            // ("PlayerName_2", 20, "1234567890");
            // await lotteryInstance.connect(addr1).addNewParticipant
            // ("PlayerName_3", 30, "1234567890");
            // await lotteryInstance.connect(addr1).addNewParticipant
            // ("PlayerName_4", 40, "1234567890");
            // await lotteryInstance.connect(addr1).addNewParticipant
            // ("PlayerName_5", 50, "1234567890");
            // total five player add
           
            //await expectRevert(lotteryInstance.connect(addr1).canHaveMaxFiveActiveLottery(),"Can't have more than 5 active lottery at a time.");
        });
    });

    describe("Buy new lottery", function() {
        let lotteryInstance, addr1, owner, addr2;
        let setLotteyStartTime, setLotteryEndTime, setLotteryDrawTime;
        beforeEach(async () => {
            returned = await loadFixture(deployLotteryFixture);
            lotteryInstance = returned.lotteryInstance;
            addr1 = returned.addr1;
            addr2 = returned.addr2;
            owner = returned.owner;

            // set lottery start time
            setLotteyStartTime = await time.latest();
            // set lottery end time (ends in 1 hour)
            setLotteryEndTime = setLotteyStartTime + 3600;
            // set lottery draw time (lucky draw after 5 mins after it ends)
            setLotteryDrawTime = setLotteryEndTime + 300;
            await lotteryInstance.connect(owner).
            setLottery('Diwali Dhamaka',setLotteyStartTime,setLotteryEndTime,setLotteryDrawTime, ethers.utils.parseEther('1'));
            await lotteryInstance.connect(addr1).addNewParticipant
            (playerOneInfo.name, playerOneInfo.age, playerOneInfo.mobile_no);
            // const t1 = await lotteryInstance.connect(addr1).allLottery(1);
            // console.log("Ticket",t1);
        });

        it("User can't buy lottery if Lottery is not active", async () => {
            // await expectRevert(lotteryInstance.connect(addr1).buyLottery(1),
            // "Lottery is not open.");
            await expect(lotteryInstance.connect(addr1).buyLottery(1)).to.be.reverted;
        });

        it("Owner can't buy the lottery", async () => {
            await lotteryInstance.connect(owner).updateToActive(1);
           await expectRevert(lotteryInstance.connect(owner).buyLottery(1),
           "Owner of this lottery can't apply");
           await expect(lotteryInstance.connect(owner).buyLottery(1)).to.be.reverted;
        });

        it("User can't buy lottery if not registered", async () => {
            await lotteryInstance.connect(owner).updateToActive(1);
            await expectRevert(lotteryInstance.connect(addr2)
            .buyLottery(1),"Please register before entering game.");
            expect(lotteryInstance.connect(addr2)
            .buyLottery(1)).to.be.reverted;
        });

        it("User can buy lottery if Lottery is open", async () => {
            await lotteryInstance.connect(owner).updateToActive(1);
            await lotteryInstance.connect(addr1).buyLottery(1,{value: ethers.utils.parseEther('1')});
            //time.lat
            //const userTicketCount = await lotteryInstance.activeTickets(addr1.address);
           // const tt2 = (await lotteryInstance.connect(addr1).allLottery(1)).status;
           //console.log("Data address", userTicketCount);
           // expect(t.lottery_ID).to.equal(1);
        });

        it("Time manipulation", async () => {
            // set lottery to active mode
            // await lotteryInstance.connect(owner).updateToActive(1);
            // // forward time 3000s (1 hrs)
            // await time.increase(setLotteryEndTime + 1);
            // // set lottery to pending draw mode
            // await lotteryInstance.connect(owner).updateLotteryStatus(2);
            // // forward time 300s (5 mins)
            // await time.increase(setLotteryDrawTime + 1);
            // //await lotteryInstance.connect(addr1).buyLottery(1);
            // //time.latestBlock();
            // let t = await time.latest();
            // console.log("Current Time", t);
            // await time.increase(1800);
            // t = await time.latest();
            //console.log("Increase by 30 mins", t);
            //time.lat
            //await lotteryInstance.connect(addr1).allLottery[1].status = 1;
           // const tt2 = (await lotteryInstance.connect(addr1).allLottery(1)).status;
           // console.log("Data 2", tt2);
           // expect(t.lottery_ID).to.equal(1);
        });

    });
    
});