import React from "react";
import { Label } from "../resource/widget/system-components/label/Label";
import { ProgramProvider } from "../resource/widget/system-control/ProgramContext";
import { ComponentProvider } from "../resource/widget/system-control/ComponentContext";

export default {
  title: "DS Widget/Label",
  component: Label,
};

const Template = (args) => {
  return (
    <ComponentProvider>
      <ProgramProvider>
        <Label {...args} />
      </ProgramProvider>
    </ComponentProvider>
  );
};

export const stories = Template.bind({});
stories.args = {
  color: "green",
  text: "123",
};
