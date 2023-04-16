
const {expect} = require('chai');
const {ethers} = require('hardhat');
const {loadFixture, time} = require('@nomicfoundation/hardhat-network-helpers');
const {expectRevert} = require("@openzeppelin/test-helpers");
const {allPlayers} = require("./fixtures");
describe("Owner of the contract", async function() {

    let lotteryInstance, currentTime, owner, addr1, addr2, addr3, addr4, addr5, addr6;
    const toEther = ethers.utils.parseEther("1");

    async function deployOwnerControlsFixture() {
        const OwnerCon = await ethers.getContractFactory("OwnerLotteryControls");
        const ownerControls = await OwnerCon.deploy();
        currentTime = await time.latest();
        await ownerControls.deployed();
        const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
        return {ownerControls, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
    }
        //beforeEach(async () => {});
    async function intialSetup() {

        returned = await loadFixture(deployOwnerControlsFixture);
        lotteryInstance = returned.ownerControls;
        owner = returned.owner;
        addr1 = returned.addr1;
        addr2 = returned.addr2;
        addr3 = returned.addr3;
        addr4 = returned.addr4;
        addr5 = returned.addr5;
        addr6 = returned.addr6;

        // set lottery start time
        setLotteyStartTime = await time.latest();
        // set lottery end time (ends in 1 hour)
        setLotteryEndTime = setLotteyStartTime + 3600;
        // set lottery draw time (lucky draw after 5 mins after it ends)
        setLotteryDrawTime = setLotteryEndTime + 300;
        await lotteryInstance.connect(owner).
        setLottery('Diwali Dhamaka',setLotteyStartTime,setLotteryEndTime,setLotteryDrawTime, ethers.utils.parseEther('1'));
        // creating player 1
        await lotteryInstance.connect(addr1).addNewParticipant
        (allPlayers[0].name, allPlayers[0].age, allPlayers[0].mobile_no);
        // creating player 2
        await lotteryInstance.connect(addr2).addNewParticipant
        (allPlayers[1].name, allPlayers[1].age, allPlayers[1].mobile_no);
        // creating player 3
        await lotteryInstance.connect(addr3).addNewParticipant
        (allPlayers[2].name, allPlayers[2].age, allPlayers[2].mobile_no);
        // creating player 4
        await lotteryInstance.connect(addr4).addNewParticipant
        (allPlayers[3].name, allPlayers[3].age, allPlayers[3].mobile_no);
        // creating player 5
        await lotteryInstance.connect(addr5).addNewParticipant
        (allPlayers[4].name, allPlayers[4].age, allPlayers[4].mobile_no);
        // making lottery game live
        await lotteryInstance.connect(owner).updateToActive(1);
        // players buying lottery tickets
        await lotteryInstance.connect(addr1).buyLottery(1,{value: ethers.utils.parseEther('1')});
        await lotteryInstance.connect(addr2).buyLottery(1,{value: ethers.utils.parseEther('1')});
        await lotteryInstance.connect(addr3).buyLottery(1,{value: ethers.utils.parseEther('1')});
        await lotteryInstance.connect(addr4).buyLottery(1,{value: ethers.utils.parseEther('1')});
        await lotteryInstance.connect(addr5).buyLottery(1,{value: ethers.utils.parseEther('1')});
        
    }

    describe("Lottery Controls", async () => {
        let ownerInstance, owner, addr1, addr2;
        beforeEach(async() => {
            const deployedContract = await loadFixture(deployOwnerControlsFixture);
            ownerInstance = deployedContract.ownerControls;
            owner = deployedContract.owner;
            addr1 = deployedContract.addr1;
            addr2 = deployedContract.addr2;
        });

        it("Only Owner is allowed to update contract controls", async()=> {
            // pause the contract
            await expectRevert(ownerInstance.connect(addr1).pauseTheContract(),"Only Owner is permitted");
            await expect(ownerInstance.connect(addr2).pauseTheContract()).to.be.rejected;
            // resume the contract
            await expectRevert(ownerInstance.connect(addr1).resumeTheContract(),"Only Owner is permitted");
            await expect(ownerInstance.connect(addr2).resumeTheContract()).to.be.rejected;
            // stop and destroy the contract
            await expectRevert(ownerInstance.connect(addr1).stopAndDestoryTheContract(),"Only Owner is permitted");
            await expect(ownerInstance.connect(addr1).stopAndDestoryTheContract()).to.be.rejected;
        })

        it("Lottery contract can be paused restricting anyone to perform any update", async () => {
            await ownerInstance.connect(owner).pauseTheContract();
            expect(await ownerInstance.connect(owner).contractState()).to.be.equal(1);
            await expectRevert(ownerInstance.connect(owner).createNewLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther),"Contract is not in active mode");
        });

        it("Lottery contract can be resumed to perform any update", async () => {
            await ownerInstance.connect(owner).pauseTheContract();
            expect(await ownerInstance.connect(owner).contractState()).to.be.equal(1);
            await ownerInstance.connect(owner).resumeTheContract();
            expect(await ownerInstance.connect(owner).contractState()).to.be.equal(0);
            await ownerInstance.connect(owner).createNewLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
            const lotteryDetails = await ownerInstance.connect(owner).getLotteryDetail(1);
            expect(lotteryDetails.lootName).to.be.equal("Diwali Dhamaka");
        });

    });

    describe("Create Lottery", () => {

        it("Only Owner can create a new lottery", async () => {
            const {ownerControls:ownerInstance, addr1 } = await loadFixture(deployOwnerControlsFixture);
            await expectRevert(ownerInstance.connect(addr1).createNewLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther), "Only Owner is permitted");
        });
        
        it("Lottery Won't be created if contract is not active", async () => {
            const {ownerControls:ownerInstance, owner } = await loadFixture(deployOwnerControlsFixture);
            // update the contract state to paused
            ownerInstance.connect(owner).updateContractToPaused();
            expect(await ownerInstance.connect(owner).contractState()).to.be.equal(1);
            await expectRevert(ownerInstance.connect(owner).createNewLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther),"Contract is not in active mode");
        });

        it("Contract should be up and running, then only a lottery ticket can be create", async () => {
            const {ownerControls:ownerInstance, owner } = await loadFixture(deployOwnerControlsFixture);
            expect(await ownerInstance.connect(owner).contractState()).to.be.equal(0);
        });

        it("Ticket price should be minimum of 1 ether", async () => {
            const {ownerControls:ownerInstance,owner } = await loadFixture(deployOwnerControlsFixture);
            await expect(ownerInstance.connect(owner).createNewLottery('Diwali Dhamaka',currentTime, currentTime+3600, currentTime+3600+300, ethers.utils.parseEther("0.1"))).to.be.revertedWith("Ticket price should be at least 1 ether");
        });

        it("Owner should successfully create a lottery ticket", async () => {
            const {ownerControls:ownerInstance,owner } = await loadFixture(deployOwnerControlsFixture);
            expect(await ownerInstance.connect(owner).lotteryCount()).to.be.equal(0);
            await ownerInstance.connect(owner).createNewLottery('Diwali Dhamaka',currentTime, currentTime+3600, currentTime+3600+300, toEther);
            const currentLotteryCount = await ownerInstance.connect(owner).lotteryCount();
            expect(await ownerInstance.connect(owner).lotteryCount()).to.be.equal(currentLotteryCount);
            const newlyLotteryTicket = await ownerInstance.connect(owner).allLottery(currentLotteryCount);
            expect(newlyLotteryTicket.lootName).to.be.equal("Diwali Dhamaka");
        });
    
    });

    describe("End Lottery", () => {
        let ownerInstance, owner, addr1, addr2, lotteryID;
        beforeEach(async()=> {
            const deployedContract =  await loadFixture(deployOwnerControlsFixture);
            ownerInstance = deployedContract.ownerControls;
            owner = deployedContract.owner;
            addr1 = deployedContract.addr1;
            addr2 = deployedContract.addr2;
            // Lottery Created
            await ownerInstance.connect(owner).createNewLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
            lotteryID = await ownerInstance.connect(owner).lotteryCount();
            // Lottery status set to active
            //await ownerInstance.connect(owner).updateLotteryToActive(lotteryID);
        });

        it("Only owner can change the status of a lottery", async() => {
            await ownerInstance.connect(owner).updateLotteryToActive(lotteryID);
            const lotteryDetails = await ownerInstance.connect(owner).getLotteryDetail(1);
            expect(lotteryDetails.status).to.be.equal(1);
        });

        it("No one apart from the owner of the contract can change the status of a lottery", async() => {
            await expectRevert(ownerInstance.connect(addr1).updateLotteryToActive(lotteryID), "Only Owner is permitted");
            await expect(ownerInstance.connect(addr1).updateLotteryToActive(lotteryID)).to.be.reverted;
        });

        it("Contract should be up and running, then only a lottery ticket can be ended", async () => {
            const {ownerControls:ownerInstance, owner } = await loadFixture(deployOwnerControlsFixture);
            expect(await ownerInstance.connect(owner).contractState()).to.be.equal(0);
        });

        it("We can't ended lottery if its status is not active", async() =>{
            await expectRevert(ownerInstance.connect(owner).endLottery(lotteryID),"Lottery is not open.");
        });

        it("We can ended lottery only if its status is active", async() =>{
            await ownerInstance.connect(owner).updateLotteryToActive(lotteryID);
            const lotteryDetails = await ownerInstance.connect(owner).getLotteryDetail(1);
            expect(lotteryDetails.status).to.be.equal(1);
        });

        it("Lottery can't be ended if its end time has not passed.", async() => {
            await ownerInstance.connect(owner).updateLotteryToActive(lotteryID);
            await expectRevert(ownerInstance.connect(owner).endLottery(1),"Time left to end the lottery");
            expect(ownerInstance.connect(owner).endLottery(1)).to.be.reverted;
        });

        it("Lottery can be ended if its end time has passed.", async() => {
            await ownerInstance.connect(owner).updateLotteryToActive(lotteryID);
            const lotteryDetails = await ownerInstance.connect(owner).getLotteryDetail(1);
            expect(lotteryDetails.status).to.be.equal(1);
            time.increase(currentTime+3600);
            await ownerInstance.connect(owner).endLottery(1);
            const lotteryPendingStatus = await ownerInstance.connect(owner).getLotteryDetail(1);
            expect(lotteryPendingStatus.status).to.be.equal(2);
        });
    });

    describe("Luck Draw", async () => {

        it("Only Owner is allowed to draw lottery", async() => {
            await intialSetup();
            await expectRevert(lotteryInstance.connect(addr1).lotteryLuckyDraw(1),"Only Owner is permitted");
            await expect(lotteryInstance.connect(addr1).lotteryLuckyDraw(1)).to.be.rejected;
        });

        it("Contract state should be Up to draw a lottery", async () => {
            await intialSetup();
            lotteryInstance.connect(owner).updateContractToPaused();
            await expectRevert(lotteryInstance.connect(owner).lotteryLuckyDraw(1),"Contract is not in active mode");
        });

        it("5% commission will be charged", async () => {                                               
            await intialSetup();
            expect(await lotteryInstance.provider.getBalance(lotteryInstance.address)).to.be.equal(ethers.utils.parseEther("5.0"));            
            const lotteryDetails = await lotteryInstance.connect(owner).getLotteryDetail(1);
            const commission = (lotteryDetails.totalCollection / 100) * 5;
            time.increaseTo(lotteryDetails.endDateTime);
            await lotteryInstance.connect(owner).endLottery(1);
            time.increaseTo(lotteryDetails.drawDateTime);
            await lotteryInstance.connect(owner).lotteryLuckyDraw(1);
            expect(await lotteryInstance.provider.getBalance(lotteryInstance.address)).not.to.be.equal(ethers.utils.parseEther("5"));
            expect(await lotteryInstance.provider.getBalance(lotteryInstance.address)).to.be.equal(ethers.utils.parseEther(ethers.utils.formatEther(`${commission}`)));
        });
    });

    describe("Lottery Funds", async ()=>{

        it("winning amount credited to Participant's account", async () => {
            await intialSetup();
            let lotteryDetails = await lotteryInstance.connect(owner).getLotteryDetail(1);
            const participants_1_RemainingBal = await lotteryInstance.provider.getBalance(addr1.address);
            const participants_2_RemainingBal = await lotteryInstance.provider.getBalance(addr2.address);
            const participants_3_RemainingBal = await lotteryInstance.provider.getBalance(addr3.address);
            const participants_4_RemainingBal = await lotteryInstance.provider.getBalance(addr4.address);
            const participants_5_RemainingBal = await lotteryInstance.provider.getBalance(addr5.address);
            const allPlayersArrdess  = [addr1.address, addr2.address, addr3.address, addr4.address, addr5.address];
            const allPlayersRemainingBal = [participants_1_RemainingBal, participants_2_RemainingBal, participants_3_RemainingBal, participants_4_RemainingBal, participants_5_RemainingBal];

            time.increaseTo(lotteryDetails.endDateTime);
            await lotteryInstance.connect(owner).endLottery(1);
            time.increaseTo(lotteryDetails.drawDateTime);
            await lotteryInstance.connect(owner).lotteryLuckyDraw(1);
            lotteryDetails = await lotteryInstance.connect(owner).getLotteryDetail(1);
            for(let i = 0; i < allPlayersArrdess.length; i++){
                if(allPlayersArrdess[i] == lotteryDetails.firstWinner){
                 expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).not.to.be.equal(allPlayersRemainingBal[i]);  
                 expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).to.be.greaterThan(allPlayersRemainingBal[i]);
                }
                else {
                    expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).to.be.equal(allPlayersRemainingBal[i]); 
                }
                if(allPlayersArrdess[i] == lotteryDetails.secondWinner){
                    expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).not.to.be.equal(allPlayersRemainingBal[i]);  
                    expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).to.be.greaterThan(allPlayersRemainingBal[i]);
                }
                else {
                    expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).to.be.equal(allPlayersRemainingBal[i]); 
                }
                if(allPlayersArrdess[i] == lotteryDetails.firstWinner){
                    expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).not.to.be.equal(allPlayersRemainingBal[i]);  
                    expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).to.be.greaterThan(allPlayersRemainingBal[i]);
                }
                else {
                    expect(await lotteryInstance.provider.getBalance(allPlayersArrdess[i])).to.be.equal(allPlayersRemainingBal[i]); 
                   }
            }
        });

        // it("Transaction cost to Participant's for creating account", async () => {
        //     await intialSetup();
        //     expect(await lotteryInstance.provider.getBalance(addr6.address)).to.be.equal(ethers.utils.parseEther("10000"));
        //     await lotteryInstance.connect(addr6).addNewParticipant(allPlayers[5].name, allPlayers[5].age, allPlayers[5].mobile_no);
        //     expect(await lotteryInstance.provider.getBalance(addr6.address)).to.be.equal(ethers.utils.parseEther("9999.99991034499205193"));
        // });

        // it("Participant buying lottery ticket", async () => {
        //     await intialSetup();
        //     await lotteryInstance.connect(addr6).addNewParticipant(allPlayers[5].name, allPlayers[5].age, allPlayers[5].mobile_no);
        //     expect(await lotteryInstance.provider.getBalance(addr6.address)).to.be.equal(ethers.utils.parseEther("9999.99991034499205193"));
        //     expect(await lotteryInstance.provider.getBalance(lotteryInstance.address)).to.be.equal(ethers.utils.parseEther("5"));
        //     await lotteryInstance.connect(addr6).buyLottery(1,{value: ethers.utils.parseEther('1')});
        //     expect(await lotteryInstance.provider.getBalance(addr6.address)).to.be.equal(ethers.utils.parseEther("9998.999721871821045018"));
        //     expect(await lotteryInstance.provider.getBalance(lotteryInstance.address)).to.be.equal(ethers.utils.parseEther("6"));
        // });

        it("Transfer money to winners", async () => {

            await intialSetup();
            expect(await lotteryInstance.provider.getBalance(lotteryInstance.address)).to.be.equal(ethers.utils.parseEther("5.0"));
        });

    });
});