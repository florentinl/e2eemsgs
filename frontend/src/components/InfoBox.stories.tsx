import { type Meta, type StoryObj } from "@storybook/react";
import InfoBox from "./InfoBox";

const meta: Meta<typeof InfoBox> = {
  title: "Components/ErrorBox",
  component: InfoBox,
  tags: ["autodocs"],
  args: {
    show: true,
    content: "Text content"
  },
};

export default meta;

export const Default: StoryObj<typeof InfoBox> = {};
