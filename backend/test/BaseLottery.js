const {expect} = require('chai');
const {ethers} = require('hardhat');
const {loadFixture, time} = require("@nomicfoundation/hardhat-network-helpers");
const {expectRevert} = require("@openzeppelin/test-helpers");

describe("Base lottery test suites", async () => {

    let currentTime;
    const toEther = ethers.utils.parseEther("1");

    async function getTheContractLoaded() {

        const BaseLottery = await ethers.getContractFactory("BaseLottery");
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        
        const baseLottery = await BaseLottery.deploy(owner.address);
        currentTime = await time.latest();
        await baseLottery.deployed();
        
        return {baseLottery, owner, addr1, addr2, addr3, addr4};
    }

    describe("Update contract state", async ()=> {
        let baseLottery, owner, addr1, addr2;

        beforeEach(async () => {
            const newBaseLottery = await loadFixture(getTheContractLoaded);
            baseLottery = newBaseLottery.baseLottery;
            owner = newBaseLottery.owner;
            addr1 = newBaseLottery.addr1;
            addr2 = newBaseLottery.addr2;
        });

        it("Contract is up when deployed", async ()=>{
            expect(await baseLottery.connect(addr1).contractState()).to.be.equal(0);
        });

        it("Only owner can update the state", async ()=>{
           await expect(baseLottery.connect(addr1).UpdateContractState(1)).to.be.reverted;
           await expectRevert(baseLottery.connect(addr1).UpdateContractState(1),"Only Owner is permitted");
        });

        it("Contract can be paused", async () => {
            await baseLottery.connect(owner).UpdateContractState(1);
            expect(await baseLottery.connect(owner).contractState()).to.be.equal(1);
        });

        it("Contract can be stoped", async () => {
            await expectRevert(baseLottery.connect(owner).UpdateContractState(2),"Contract is destroyed.");
        });
    });

    describe("Create new lottery", async () => {
        let baseLottery, owner, addr1, addr2;

        beforeEach(async () => {
            const newBaseLottery = await loadFixture(getTheContractLoaded);
            baseLottery = newBaseLottery.baseLottery;
            owner = newBaseLottery.owner;
            addr1 = newBaseLottery.addr1;
            addr2 = newBaseLottery.addr2;
        });

        it("Only owner can create a ticket", async() => {
            await expect(baseLottery.connect(addr1).setLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther)).to.be.reverted;
            await expect(baseLottery.connect(addr1).setLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther)).to.be.revertedWith("Only Owner is permitted"); 
        });

        it("Owner can create a ticket", async() =>  {
            await expect(await baseLottery.lotteryCount()).to.be.equal(0);
            await baseLottery.connect(owner).setLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
            await expect(await baseLottery.lotteryCount()).to.be.equal(1);
        });

        it("Ticket should have created", async () => {
            await baseLottery.connect(owner).setLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
            const createdLottery = await baseLottery.allLottery(1);
            await expect(createdLottery.lootName).to.be.equal('Diwali Dhamaka');
        });

        it("New ticket should have added everytime", async() =>  {
            await baseLottery.connect(owner).setLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
            await expect(await baseLottery.lotteryCount()).to.be.equal(1);
            await baseLottery.connect(owner).setLottery('Holi Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
            await expect(await baseLottery.lotteryCount()).to.be.equal(2);
            const DiwaliLottery = await baseLottery.allLottery(1);
            const HoliLottery = await baseLottery.allLottery(2);
            expect(DiwaliLottery.lootName).to.be.equal('Diwali Dhamaka');
            expect(HoliLottery.lootName).to.be.equal('Holi Dhamaka');
            
        });
    });

    describe("Update any lottery", async () => {
        let baseLottery, owner, addr1, addr2;

        beforeEach(async () => {
            const newBaseLottery = await loadFixture(getTheContractLoaded);
            baseLottery = newBaseLottery.baseLottery;
            owner = newBaseLottery.owner;
            addr1 = newBaseLottery.addr1;
            addr2 = newBaseLottery.addr2;
            await baseLottery.connect(owner).setLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
        });

        it("Only participant can updated ticket while buy a ticket", async() => {
            await expect(baseLottery.connect(owner).updateLottery(1,{value: ethers.utils.parseEther("1")})).to.be.reverted;
            await expect(baseLottery.connect(owner).updateLottery(1,{value: ethers.utils.parseEther("1")})).to.be.revertedWith("Owner of this lottery can't apply"); 
        });

        it("participant can updated ticket while buy a ticket", async() =>  {
            const beforeLotteryUpdate = await baseLottery.allLottery(1);
            expect(beforeLotteryUpdate.totalCollection).to.be.equal(0);
            expect(beforeLotteryUpdate.ticketSerialNo).to.be.equal(0);
            await baseLottery.connect(addr1).updateLottery(1,{value: ethers.utils.parseEther("1")});
            const afterLotteryUpdate = await baseLottery.allLottery(1);
            expect(afterLotteryUpdate.totalCollection).to.be.equal(ethers.utils.parseEther("1"));
            expect(afterLotteryUpdate.ticketSerialNo).to.be.equal(1);
        });
    });

    describe("Getter Functions", async () => {
        let baseLottery, owner, addr1, addr2;

        beforeEach(async () => {
            const newBaseLottery = await loadFixture(getTheContractLoaded);
            baseLottery = newBaseLottery.baseLottery;
            owner = newBaseLottery.owner;
            addr1 = newBaseLottery.addr1;
            addr2 = newBaseLottery.addr2;
            await baseLottery.connect(owner).setLottery('Diwali Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
            await baseLottery.connect(owner).setLottery('Holi Dhamaka', currentTime, currentTime+3600, currentTime+3600+300, toEther);
        });

        it("Get All Lottery Count", async() => {
            expect(await baseLottery.getAllLotteryCount()).to.be.equal(2);
        });

        it("check if game is inactive", async() => {
            expect(await baseLottery.checkIfGameIsInactive(1)).to.be.reverted;
            expect(await baseLottery.checkIfGameIsInactive(1)).to.be.revertedWith("Lottery not even started yet.");
        });

        it("check if lottery is in pending state", async () => {
            expect(await baseLottery.checkIfGameIsInactive(1)).to.be.reverted;
            expect(await baseLottery.checkIfGameIsInactive(1)).to.be.revertedWith("Lottery can't be drawn for now.");
        });

    });

    



});