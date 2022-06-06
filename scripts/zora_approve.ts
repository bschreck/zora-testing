import { ethers } from "hardhat";
// import mainnetZoraAddresses from "@zoralabs/v3/dist/addresses/1.json"; // Mainnet addresses, 4.json would be Rinkeby Testnet
import rinkebyZoraAddresses from "@zoralabs/v3/dist/addresses/4.json"; // Mainnet addresses, 4.json would be Rinkeby Testnet
import { IERC721__factory } from "@zoralabs/v3/dist/typechain/factories/IERC721__factory";
import { IERC20__factory } from "@zoralabs/v3/dist/typechain/factories/IERC20__factory";
import { ZoraModuleManager__factory } from "@zoralabs/v3/dist/typechain/factories/ZoraModuleManager__factory";

async function main() {
  // This should be an ethers.js signer instance:
  // You can get the signer from a wallet using web3modal/rainbowkit/blocknative wallet etc.
  // See: https://docs.ethers.io/v5/api/signer/
  // const provider = new ethers.providers.Web3Provider(web3.currentProvider, 1);
  // const provider = ethers.getDefaultProvider();
  // const signer = await provider.getSigner();
  const signers = await ethers.getSigners();
  const signer = signers[0];
  // const moduleManagerAddress = rinkebyZoraAddresses.ZoraModuleManager;
  const ownerAddress = signers[0].address;

  // Initialize NFT demo contract
  const nftContractAddress = "0x7bEFeA06AA6beE4fCc5AaB98b1183398b22C7948"; // my nft contract
  const erc721Contract = IERC721__factory.connect(nftContractAddress, signer);

  // Initialize ERC20 currency demo contract
  // const erc20ContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC token address
  // const erc20Contract = IERC20__factory.connect(erc20ContractAddress, signer);

  // Initialize Zora V3 Module Manager contract
  const moduleManagerContract = ZoraModuleManager__factory.connect(
    rinkebyZoraAddresses.ZoraModuleManager, signer
  );

  const erc721TransferHelperAddress = rinkebyZoraAddresses.ERC721TransferHelper;
  let approved = await erc721Contract.isApprovedForAll(
    ownerAddress, // NFT owner address
    erc721TransferHelperAddress // V3 Module Transfer Helper to approve
  );

  // If the approval is not already granted, add it.
  if (approved === false) {
    // Notice: Since this interaction submits a transaction to the blockchain it requires an ethers signer.
    //  A signer interfaces with a wallet. You can use walletconnect or injected web3.
    await erc721Contract.setApprovalForAll(erc721TransferHelperAddress, true);
    console.log("approved");
  } else {
    console.log("already approved");
  }

  const moduleAddressesToApprove = [];
  const zoraModuleAddresses = [rinkebyZoraAddresses.AsksV1_1, rinkebyZoraAddresses.OffersV1];

  for (var addr of zoraModuleAddresses) {
    // Approving Asks v1.1
    const approved = await moduleManagerContract.isModuleApproved(
        ownerAddress, addr
    );
    if (!approved) {
      moduleAddressesToApprove.push(addr);
    }
  }

  if (moduleAddressesToApprove.length > 0) {
    // Approving Asks v1.1 and Offers v1.0
    await moduleManagerContract.setBatchApprovalForModules(
        moduleAddressesToApprove,
        true
    );
    console.log("approved", moduleAddressesToApprove);
  } else {
    console.log("all already approved");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
