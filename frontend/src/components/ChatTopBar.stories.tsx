import { type Meta, type StoryObj } from "@storybook/react";
import ChatTopBar from "./ChatTopBar";

const meta: Meta<typeof ChatTopBar> = {
  title: "Components/ChatTopBar",
  component: ChatTopBar,
  tags: ["autodocs"],
  args: {
    groupName: "Group Name",
    onBack: () => {},
    onSettings: () => {},
  },
};

export default meta;

export const Default: StoryObj<typeof ChatTopBar> = {};
