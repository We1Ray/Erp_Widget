import React from "react";
import { TextBox } from "../resource/widget/system-components/textbox/TextBox";
import { ProgramProvider } from "../resource/widget/system-control/ProgramContext";
import { ComponentProvider } from "../resource/widget/system-control/ComponentContext";

export default {
  title: "DS Widget/Textbox",
  component: TextBox,
};

const Template = (args) => {
  return (
    <ComponentProvider>
      <ProgramProvider>
        <TextBox {...args} />
      </ProgramProvider>
    </ComponentProvider>
  );
};

export const stories = Template.bind({});
stories.args = {
  name: "abc",
  color: "green",
  backgroundColor: "yellow",
  visible: true,
  defaultValue: "abc",
};
