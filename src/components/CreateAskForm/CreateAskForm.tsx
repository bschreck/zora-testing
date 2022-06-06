import React, { useEffect, useState } from "react";
import { formatEther } from "@ethersproject/units";
import { BigNumber, getDefaultProvider } from "ethers";
import { ContentBlock } from "../base/base";
import { TextBold } from "../../typography/Text";
import { Colors, BorderRad, Transitions } from "../../global/styles";
import styled from "styled-components";
import { useEtherBalance, useEthers } from "@usedapp/core";
import { Button } from "../base/Button";
import { utils } from "ethers";
import { StatusAnimation } from "../Transactions/TransactionForm";
import { Contract } from "@ethersproject/contracts";
import {
  DAppProvider,
  useContractFunction,
  useSendTransaction,
  useCall,
  useCalls,
  CallResult,
} from "@usedapp/core";

import { TimeNFT } from "../../../typechain/TimeNFT";
import TimeNFTAbi from "../../../artifacts/contracts/TimeNFT.sol/TimeNFT.json";
import { AsksV11__factory } from "@zoralabs/v3/dist/typechain/factories/AsksV11__factory";
import rinkebyZoraAddresses from "@zoralabs/v3/dist/addresses/4.json"; // Mainnet addresses, 4.json would be Rinkeby Testnet
import { ZoraModuleManager__factory } from "@zoralabs/v3/dist/typechain/factories/ZoraModuleManager__factory";
import WETH10 from "../../abi/Weth10.json";

const erc721TransferHelperAddress = rinkebyZoraAddresses.ERC721TransferHelper;
const zoraModuleAddresses = [rinkebyZoraAddresses.AsksV1_1, rinkebyZoraAddresses.OffersV1];
const formatter = new Intl.NumberFormat("en-us", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const formatBalance = (balance: BigNumber | undefined) =>
  formatter.format(parseFloat(formatEther(balance ?? BigNumber.from("0"))));

const useGetModulesToApprove = (moduleManagerContract: Contract, ownerAddr: string) => {
  const approved = useCalls(
    zoraModuleAddresses.map((moduleAddr: any) => ({
            contract: moduleManagerContract,
            method: "isModuleApproved",
            args: [ownerAddr, moduleAddr],
          }))
  )
  console.log("APPROVED", approved);
  const returnModules: string[] = [];
  approved.forEach((val, index) => {
    if (val && val.value && val.value[0] === false) {
      returnModules.push(zoraModuleAddresses[index]);
    }
  });
  return returnModules;
};

const useErc721NeedsApproveTransferHelper = (
    nftContract: Contract,
    ownerAddr: string,
    erc721TransferHelperAddress: string,
  ) => {
    const { value, error } =
      useCall(
        ownerAddr && erc721TransferHelperAddress && {
          contract: nftContract,
          method: "isApprovedForAll",
          args: [ownerAddr, erc721TransferHelperAddress],
        }
      ) ?? {};
    if (error) {
      console.error("nftContract isApprovedForAll error:", error.message);
      return undefined;
    }
    return !value?.[0];
};

const InputComponent = () => {
  console.log("starting inputcomponent");
  const { account } = useEthers();
  console.log("account in inputcomponent", account);

  const [amount, setAmount] = useState("0");
  const [tokenId, setTokenID] = useState("0x");
  const [findersFeeBps, setFindersFeeBps] = useState("0");
  const [disabled, setDisabled] = useState(false);
  console.log("finished usestates in inputcomponent");

  // const { sendTransaction, state } = useSendTransaction({ transactionName: 'Send Ethereum' })
  const myNFTInterface = new utils.Interface(TimeNFTAbi.abi);
  const nftContractAddress = "0x7bEFeA06AA6beE4fCc5AaB98b1183398b22C7948"; // my nft contract
  const nftContract = new Contract(nftContractAddress, myNFTInterface) as any;

  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const provider = getDefaultProvider("rinkeby");
  const { state, send } = useContractFunction(
    AsksV11__factory.connect(rinkebyZoraAddresses.AsksV1_1, provider),
    "createAsk"
  );
  console.log("finished getting state funcs in inputcomponent");

  const moduleManagerContract = ZoraModuleManager__factory.connect(
    rinkebyZoraAddresses.ZoraModuleManager, provider
  );
  console.log("moduleManagerContract:", moduleManagerContract);

  const approveFns = useContractFunction(
    moduleManagerContract,
    "setBatchApprovalForModules",
  );
  console.log("moduleManagerContract:", moduleManagerContract);

  const moduleAddressesToApprove = useGetModulesToApprove(
    moduleManagerContract,
    account,
  );
  console.log("moduleAddressesToApprove:", moduleAddressesToApprove);

  const erc721NeedsApproveTransferHelper = useErc721NeedsApproveTransferHelper(
    nftContract,
    account,
    erc721TransferHelperAddress,
  );
  console.log("erc721NeedsApproveTransferHelper:", erc721NeedsApproveTransferHelper );

  const erc721ApproveFn = useContractFunction(
    nftContract,
    "setApprovalForAll",
  );

  const doApprovals = () => {
    if (moduleAddressesToApprove.length > 0) {
      console.log("doing approvals for ", moduleAddressesToApprove);
      approveFns.send(moduleAddressesToApprove, true);
    }

    if (erc721NeedsApproveTransferHelper) {
      console.log("doing approvals for ", nftContract);
      erc721ApproveFn.send(erc721TransferHelperAddress, true);
    }
  };


  let buttonAction = "Create Ask";
  if (moduleAddressesToApprove.length > 0 || erc721NeedsApproveTransferHelper) {
    buttonAction = "Approve Zora Modules";
  }

  const createAsk = (
    tokenId: string,
    amount: string,
    account: string,
    findersFeeBps: string
  ) => {
    send(
      nftContractAddress,
      tokenId,
      amount,
      zeroAddress,
      account,
      findersFeeBps
    );
  };

  const handleClick = () => {
    setDisabled(true);
    if (moduleAddressesToApprove.length > 0 || erc721NeedsApproveTransferHelper) {
      doApprovals();
    } else {
      createAsk(tokenId, amount, account, findersFeeBps);
    }
  };

  console.log("state.status", state.status);
  useEffect(() => {
    if (state.status !== "Mining") {
      setDisabled(false);
      setAmount("0");
      setFindersFeeBps("0");
    }
  }, [state]);

  console.log("about to return from input component");

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <InputRow>
        <TokenIDInput
          id={`TokenIDInput`}
          type="text"
          value={tokenId}
          onChange={(e) => setTokenID(e.currentTarget.value)}
          disabled={disabled}
        />
        <Input
          id={`EthInput`}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
          min="0"
          disabled={disabled}
        />
        <Input
          id={`FindersFeeInput`}
          type="number"
          step="0.01"
          value={findersFeeBps}
          onChange={(e) => setFindersFeeBps(e.currentTarget.value)}
          min="0"
          disabled={disabled}
        />
        <SmallButton disabled={!account || disabled} onClick={handleClick}>
          {buttonAction}
        </SmallButton>
      </InputRow>
      <StatusAnimation transaction={state} />
    </div>
  );
};

export const CreateAskForm = () => {
  const useNftBalance = (address: string | Falsy) => {
    const myNFTInterface = new utils.Interface(TimeNFTAbi.abi);
    const nftContractAddress = "0x7bEFeA06AA6beE4fCc5AaB98b1183398b22C7948"; // my nft contract
    console.log("calling nft total supply");
    const { value, error } =
      useCall(
        address && {
          contract: new Contract(nftContractAddress, myNFTInterface), // instance of called contract
          method: "balanceOf", // Method to be called
          args: [address], // Method arguments - address to be checked for balance
        }
      ) ?? {};
    if (error) {
      console.error("nft balance error:", error.message);
      return undefined;
    }
    return value?.[0];
  };

  const useGetTokenIds = (address: string | Falsy, balance: number | Falsy) => {
    const myNFTInterface = new utils.Interface(TimeNFTAbi.abi);
    const nftContractAddress = "0x7bEFeA06AA6beE4fCc5AaB98b1183398b22C7948"; // my nft contract
    console.log("calling nft getTokenIds");
    const tokenIdReturn = useCalls(
      address && balance
      ? [...Array(balance).keys()].map((index: any) => ({
              contract: new Contract(nftContractAddress, myNFTInterface),
              method: "tokenOfOwnerByIndex",
              args: [address, index],
            }))
          : []
    )
    return tokenIdReturn.map((tokenIdReturn) => {
      if (tokenIdReturn && !tokenIdReturn.error) {
        return tokenIdReturn.value[0].toHexString();
      }
      return null;
    });
  };
  const { account } = useEthers();

  const balance = useNftBalance(account);
  // TODO this function should be in solidity
  const tokenIds = useGetTokenIds(account, balance);

  return (
    <ContentBlock style={{ padding: 0 }}>
      <TitleRow>
        <CellTitle>Create Ask</CellTitle>
        <BalanceWrapper>Your Token IDs: {tokenIds}</BalanceWrapper>
      </TitleRow>
      <LabelRow>
        <Label style={{ marginLeft: "58px" }} htmlFor={"TokenIDInput"}>
          Token ID
        </Label>
        <Label style={{ marginLeft: "58px" }} htmlFor={"EthInput"}>
          How much?
        </Label>
        <Label style={{ marginLeft: "240px" }} htmlFor={"FindersFeeInput"}>
          Finders Fee (bps)
        </Label>
      </LabelRow>
      <InputComponent />
    </ContentBlock>
  );
};

const CellTitle = styled(TextBold)`
  font-size: 18px;
`;

const LabelRow = styled.div`
  display: flex;
  margin: 32px 0 24px 0;
`;

const Label = styled.label`
  font-weight: 700;
  cursor: pointer;
  transition: ${Transitions.all};

  &:hover,
  &:focus-within {
    color: ${Colors.Yellow[500]};
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: ${Colors.Gray["300"]} 1px solid;
  padding: 16px;
`;

const BalanceWrapper = styled.div`
  color: ${Colors.Gray["600"]};
  font-size: 14px;
`;

const Input = styled.input`
  height: 100%;
  width: 120px;
  padding: 0 0 0 24px;
  border: 0;
  border-radius: ${BorderRad.m};
  -moz-appearance: textfield;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-background-clip: text;
  }
`;

const TokenIDInput = styled(Input)`
  width: 401px;
  padding: 0 0 0 38px;
`;

const InputRow = styled.div`
  height: 44px;
  display: flex;
  margin: 0 auto;
  color: ${Colors.Gray["600"]};
  align-items: center;
  border: ${Colors.Gray["300"]} 1px solid;
  border-radius: ${BorderRad.m};
  overflow: hidden;
  transition: ${Transitions.all};

  &:hover,
  &:focus-within {
    border-color: ${Colors.Black[900]};
  }
`;

const FormTicker = styled.div`
  padding: 0 8px;
`;

const SmallButton = styled(Button)`
  display: flex;
  justify-content: center;
  min-width: 95px;
  height: 100%;
  padding: 8px 24px;

  &:disabled {
    color: ${Colors.Gray["600"]};
    cursor: unset;
  }

  &:disabled:hover,
  &:disabled:focus {
    background-color: unset;
    color: unset;
  }
`;
