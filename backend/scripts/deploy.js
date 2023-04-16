

const main = async () => {

  const Lottery = await hre.ethers.getContractFactory("OwnerLotteryControls");
  const lotteryContract = await Lottery.deploy();

  await lotteryContract.deployed();

  //console.log("Transaction deployed to: ", lotteryContract.address);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } 
}

runMain();