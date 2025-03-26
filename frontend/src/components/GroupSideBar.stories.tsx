import { type Meta, type StoryObj } from "@storybook/react";
import GroupTab from "./GroupSideBar";
import type { Groups } from "../types";

const makeMessages = (n: number) => {
  const messages = [];
  for (let i = 0; i < n; i++) {
    messages.push({
      id: i.toString(),
      sender: {
        id: i.toString(),
        username: `User ${i}`,
        publickey: `PublicKey ${i}`,
      },
      content: `Message ${i}`,
    });
  }
  return messages;
};

const makeGroups: (n: number) => Groups = (n) => {
  const groups: Groups = new Map();
  for (let i = 1; i <= n; i++) {
    groups.set(i.toString(), {
      name: `Group ${i}`,
      id: i.toString(),
      symmetricKey: "",
      members: new Set(),
      messages: makeMessages(10),
    });
  }
  return groups;
};

const meta: Meta<typeof GroupTab> = {
  title: "Components/GroupTab",
  component: GroupTab,
  tags: ["autodocs"],
  args: {
    groups: makeGroups(10),
    onSelect: () => {},
  },
};

export default meta;

export const Default: StoryObj<typeof GroupTab> = {};
