require("@nomicfoundation/hardhat-toolbox");
// 6c90fda068c7ee2ed9569ea2e0f9a895286c407f9ca2937a3131c9de4de55d67
// Contact Deployed at 0xDCb956fB0bA8458263f46eFA255e33b8487cB4C4
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks:{
    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        `aa826090cccb3eb5ca7c2f5ff5cceeb2419e540f770222b81b4dff09eb1b7863`,
      ],
    },
  }
};
