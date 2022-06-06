import { expect } from "chai";
import { ethers } from "hardhat";

//describe("Greeter", function () {
//  it("Should return the new greeting once it's changed", async function () {
//    const Greeter = await ethers.getContractFactory("Greeter");
//    const greeter = await Greeter.deploy("Hello, world!");
//    await greeter.deployed();
//
//    expect(await greeter.greet()).to.equal("Hello, world!");
//
//    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
//
//    // wait until the transaction is mined
//    await setGreetingTx.wait();
//
//    expect(await greeter.greet()).to.equal("Hola, mundo!");
//  });
//});

async function mineNBlocks(n: number) {
  for (let index = 0; index < n; index++) {
    await ethers.provider.send("evm_mine", []);
  }
}

describe("TimeNFT", function () {
  it("Should return the active token", async function () {
    expect(await ethers.provider.getBlockNumber()).to.equal(0);
    const TimeNFT = await ethers.getContractFactory("TimeNFT");
    const timeNFT = await TimeNFT.deploy("timeNFT", "TNFT", 1);
    await timeNFT.deployed();

    expect(await timeNFT.totalSupply()).to.equal(0);
    await timeNFT.mint();
    await timeNFT.mint();
    expect(await timeNFT.totalSupply()).to.equal(2);
    expect(await timeNFT.activeToken()).to.equal(1);
    await mineNBlocks(1);
    expect(await ethers.provider.getBlockNumber()).to.equal(4);
    expect(await timeNFT.activeToken()).to.equal(0);
    await mineNBlocks(1);
    expect(await ethers.provider.getBlockNumber()).to.equal(5);
    expect(await timeNFT.activeToken()).to.equal(1);
    await mineNBlocks(1);
    expect(await ethers.provider.getBlockNumber()).to.equal(6);
    expect(await timeNFT.activeToken()).to.equal(0);

    for (let i = 0; i < 10; i++) {
      await timeNFT.mint();
    }
    expect(await timeNFT.totalSupply()).to.equal(12);
    expect(await ethers.provider.getBlockNumber()).to.equal(16);
    for (let i = 0; i < 12; i++) {
      await mineNBlocks(1);
      expect(await timeNFT.activeToken()).to.equal((i + 17) % 12);
    }

    await timeNFT.setNBlocksActive(2);
    expect(await timeNFT.nBlocksActive()).to.equal(2);
    expect(await ethers.provider.getBlockNumber()).to.equal(29);
    for (let i = 0; i < 24; i++) {
      await mineNBlocks(1);
      expect(await timeNFT.activeToken()).to.equal(
        Math.floor(((i + 30) % 24) / 2)
      );
    }
  });
});
