import React from "react";
import { TextQryBox } from "../src/resource/widget/system-components/textqryBox/TextQryBox";
import { ProgramProvider } from "../src/resource/widget/system-control/ProgramContext";
import { ComponentProvider } from "../src/resource/widget/system-control/ComponentContext";
import { System } from "../src/resource/widget/system-control/System";
import Qry_accounts from "./Qry_accounts";

export default {
  title: "DS Widget/TextQryBox",
  component: TextQryBox,
};

const Template = (args) => {
  return (
    <System system_uid="SYS_00001" factory="DS">
      <ComponentProvider>
        <ProgramProvider>
          <TextQryBox {...args} />
        </ProgramProvider>
      </ComponentProvider>
    </System>
  );
};

export const stories = Template.bind({});
stories.args = {
  name: "abc",
  maxLength: 50,
  dialog: {
    window: <Qry_accounts />,
    dialogID: "Qry_accounts",
    style: { height: "400px" },
  },
  text: {
    name: "ACCOUNT_UID",
    disable: true,
    visible: true,
  },
  label: {
    name: "NAME",
    operation: "get_account_info",
    api: "get_account_info",
  },
};
