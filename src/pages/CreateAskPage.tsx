import React from "react";
import { AccountButton } from "../components/account/AccountButton";
import {
  Container,
  MainContent,
  Section,
  SectionRow,
} from "../components/base/base";
import { CreateAskForm } from "../components/CreateAskForm/CreateAskForm";
import { Title } from "../typography/Title";

export const CreateAskPage = () => {
  return (
    <MainContent>
      <Container>
        <Section>
          <SectionRow>
            <Title>Create Ask</Title>
            <AccountButton />
          </SectionRow>
          <CreateAskForm />
        </Section>
      </Container>
    </MainContent>
  );
};
