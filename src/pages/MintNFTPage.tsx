import React from "react";
import { AccountButton } from "../components/account/AccountButton";
import {
  Container,
  MainContent,
  Section,
  SectionRow,
} from "../components/base/base";
import { MintNFTForm } from "../components/MintNFTForm/MintNFTForm";
import { Title } from "../typography/Title";

export const MintNFTPage = () => {
  return (
    <MainContent>
      <Container>
        <Section>
          <SectionRow>
            <Title>Mint NFT</Title>
            <AccountButton />
          </SectionRow>
          <MintNFTForm />
        </Section>
      </Container>
    </MainContent>
  );
};
