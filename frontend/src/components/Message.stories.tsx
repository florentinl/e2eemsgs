import { type Meta, type StoryObj } from "@storybook/react";
import MessageDisplay from "./Message";

const meta: Meta<typeof MessageDisplay> = {
  title: "Components/Message",
  component: MessageDisplay,
  tags: ["autodocs"],
  args: {
    msg: {
      sender: {
        username: "Alice",
        id: "1234567890",
        publickey: "1234567890",
      },
      content: "Hello there! This is a multiple line messages\nline2\nline3",
      id: "123",
    },
  },
};

export default meta;

export const Default: StoryObj<typeof MessageDisplay> = {};

export const LongOneLiner: StoryObj<typeof MessageDisplay> = {
  args: {
    msg: {
      content:
        "This is a very very very very very very very very very very very very very very very very very very very very very very very very very very long one line message !",
      id: "123",
      sender: {
        id: "",
        username: "",
        publickey: "",
      },
    },
  },
};
