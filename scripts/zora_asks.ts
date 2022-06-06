import { ethers } from "hardhat";
// import mainnetZoraAddresses from "@zoralabs/v3/dist/addresses/1.json"; // Mainnet addresses, 4.json would be Rinkeby Testnet
import rinkebyZoraAddresses from "@zoralabs/v3/dist/addresses/4.json"; // Mainnet addresses, 4.json would be Rinkeby Testnet
import { IERC721__factory } from "@zoralabs/v3/dist/typechain/factories/IERC721__factory";
import { IERC20__factory } from "@zoralabs/v3/dist/typechain/factories/IERC20__factory";
import { ZoraModuleManager__factory } from "@zoralabs/v3/dist/typechain/factories/ZoraModuleManager__factory";
import { AsksV11__factory } from "@zoralabs/v3/dist/typechain/factories/AsksV11__factory";

async function main() {
  const signers = await ethers.getSigners();
  const signer = signers[0];
  const ownerAddress = signers[0].address;

  // Initialize NFT demo contract
  const nftContractAddress = "0x7bEFeA06AA6beE4fCc5AaB98b1183398b22C7948"; // my nft contract
  // const erc721Contract = IERC721__factory.connect(nftContractAddress, signer);

  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = MyNFT.attach(nftContractAddress);

  try {
    await myNFT.ownerOf("1");
    console.log("already owner");
  } catch (err) {
    console.log(err);
    console.log("minting");
    await myNFT.mint();
    console.log("minted");
  }

  const askModuleContract = AsksV11__factory.connect(rinkebyZoraAddresses.AsksV1_1, signer);

  const askPrice = ethers.utils.parseEther("0.0001"); // 0.0001 ETH Sale Price
  const findersFeeBps = "200"; // 2% Finders Fee (in BPS)

  // Calling Create Ask
  // Notice: Since this interaction submits a transaction to the blockchain it requires a signer.
  // A signer interfaces with a wallet. You can use walletconnect or injected web3.
  await askModuleContract.createAsk(
    nftContractAddress,
    "1", // Token Id
    askPrice,
    "0x0000000000000000000000000000000000000000", // 0 address for ETH sale
    ownerAddress,
    findersFeeBps
  );
  console.log("created ask");

  console.log("updating price");
  let newAskPrice = ethers.utils.parseEther("0.0002");
  await askModuleContract.setAskPrice(
    nftContractAddress,
    "1", // Token Id
    newAskPrice,
    "0x0000000000000000000000000000000000000000", // 0 address for ETH sale
  );
  console.log("updated");

  console.log("cancelling ask");
  await askModuleContract.cancelAsk(
    nftContractAddress,
    "1", // Token Id
  );
  console.log("cancelled")

  newAskPrice = ethers.utils.parseEther("0.0003");
  console.log("creating another ask")
  await askModuleContract.createAsk(
    nftContractAddress,
    "1", // Token Id
    newAskPrice,
    "0x0000000000000000000000000000000000000000", // 0 address for ETH sale
    ownerAddress,
    findersFeeBps
  );
  console.log("created ask");

  const fillAmount = ethers.utils.parseEther("0.0003");
  // const finder = "0x17cd072cBd45031EFc21Da538c783E0ed3b25DCc"; // Address that helped find the buyer. Can be the 0 address if no address is specified
  const finder = "0x0000000000000000000000000000000000000000"; // Address that helped find the buyer. Can be the 0 address if no address is specified

  console.log("filling ask");
  await askModuleContract.fillAsk(
    nftContractAddress,
    "1", // Token Id
    "0x0000000000000000000000000000000000000000", // 0 address for ETH sale
    fillAmount,
    finder
  );
  console.log("filled");

}
//
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
