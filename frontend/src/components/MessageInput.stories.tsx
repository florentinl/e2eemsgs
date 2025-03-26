import { type Meta, type StoryObj } from "@storybook/react";
import MessageInput from "./MessageInput";

const meta: Meta<typeof MessageInput> = {
  title: "Components/MessageInput",
  component: MessageInput,
  tags: ["autodocs"],
  args: {
    maxLength: 100,
    onSend: (message) => {
      console.log("Message sent:", message);
    },
  },
};

export default meta;

export const Default: StoryObj<typeof MessageInput> = {};
