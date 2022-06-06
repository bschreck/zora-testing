import React, { useEffect, useState } from "react";
import { formatEther } from "@ethersproject/units";
import { BigNumber } from "ethers";
import { ContentBlock } from "../base/base";
import { TextBold } from "../../typography/Text";
import { Colors, BorderRad, Transitions } from "../../global/styles";
import styled from "styled-components";
import { useEtherBalance, useEthers } from "@usedapp/core";
import { Button } from "../base/Button";
import { useSendTransaction } from "@usedapp/core";
import { utils } from "ethers";
import { StatusAnimation } from "../Transactions/TransactionForm";
import { Contract } from "@ethersproject/contracts";
import { useContractFunction } from "@usedapp/core";

import { TimeNFT } from "../../../typechain/TimeNFT";
import TimeNFTAbi from "../../../artifacts/contracts/TimeNFT.sol/TimeNFT.json";
import WETH10 from "../../abi/Weth10.json";

const formatter = new Intl.NumberFormat("en-us", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const formatBalance = (balance: BigNumber | undefined) =>
  formatter.format(parseFloat(formatEther(balance ?? BigNumber.from("0"))));

const InputComponent = () => {
  const { account } = useEthers();

  const [amount, setAmount] = useState("0");
  const [address, setAddress] = useState("");
  const [disabled, setDisabled] = useState(false);

  // const { sendTransaction, state } = useSendTransaction({ transactionName: 'Send Ethereum' })
  const myNFTInterface = new utils.Interface(TimeNFTAbi.abi);
  const nftContractAddress = "0x7bEFeA06AA6beE4fCc5AaB98b1183398b22C7948"; // my nft contract
  const myNFT = new Contract(nftContractAddress, myNFTInterface) as any;
  const { state, send } = useContractFunction(myNFT, "mint", {
    transactionName: "Mint",
  });

  const handleClick = () => {
    setDisabled(true);
    // void sendTransaction({ to: address, value: utils.parseEther(amount) })
    send({});
  };

  useEffect(() => {
    if (state.status != "Mining") {
      setDisabled(false);
      setAmount("0");
      setAddress("");
    }
  }, [state]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <InputRow>
        <Input
          id={`EthInput`}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
          min="0"
          disabled={disabled}
        />
        <FormTicker>ETH to:</FormTicker>
        <AddressInput
          id={`AddressInput`}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.currentTarget.value)}
          disabled={disabled}
        />
        <SmallButton disabled={!account || disabled} onClick={handleClick}>
          Send
        </SmallButton>
      </InputRow>
      <StatusAnimation transaction={state} />
    </div>
  );
};

export const MintNFTForm = () => {
  const { account } = useEthers();
  const balance = useEtherBalance(account);

  return (
    <ContentBlock style={{ padding: 0 }}>
      <TitleRow>
        <CellTitle>Mint NFT</CellTitle>
        <BalanceWrapper>
          Your ETH balance: {formatBalance(balance)}
        </BalanceWrapper>
      </TitleRow>
      <LabelRow>
        <Label style={{ marginLeft: "58px" }} htmlFor={"EthInput"}>
          How much?
        </Label>
        <Label style={{ marginLeft: "240px" }} htmlFor={"AddressInput"}>
          To whom?
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

const AddressInput = styled(Input)`
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
