import { type Meta, type StoryObj } from "@storybook/react";
import CreateGroupDialog from "./CreateGroupDialog";

const meta: Meta<typeof CreateGroupDialog> = {
  title: "Components/CreateGroupDialog",
  component: CreateGroupDialog,
  tags: ["autodocs"],
  args: {
    onCreateGroup: () => {},
  },
};

export default meta;

export const Default: StoryObj<typeof CreateGroupDialog> = {};
