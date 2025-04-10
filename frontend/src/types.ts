import type { Group as ApiGroup, MessageContent } from "./api-client/types.gen";

export type Groups = Map<number, Group>;

export type Group = {
  id: number;
  ownerId: number;
  name: string;
  symmetricKey: string;
  members: Set<User>;
  messages: Map<number, Message>;
  draft?: string;
};

export type User = {
  id: number;
  username: string;
  publickey: string;
};

export type Message = {
  id: number;
  sender_name: string;
  content: MessageContent;
};

export type JoinGroupNotification = {
  type: "joinedGroupNotification";
  group: ApiGroup;
};

export type QuitGroupNotification = {
  type: "quitGroupNotification";
  group_id: number;
};

export type MessageNotification = {
  type: "messageNotification";
  message: MessageContent;
  sender_name: string;
};

export type Notification =
  | JoinGroupNotification
  | QuitGroupNotification
  | MessageNotification;
