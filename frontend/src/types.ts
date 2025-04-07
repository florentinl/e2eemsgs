import type {
  Group as ApiGroup,
  Message as ApiMessage,
} from "./api-client/types.gen";

export type Groups = Map<number, Group>;

export type Group = {
  id: number;
  name: string;
  symmetricKey: string;
  members: Set<User>;
  messages: Map<number, Message>;
};

export type User = {
  id: number;
  username: string;
  publickey: string;
};

export type Message = {
  id: number;
  sender_name: string;
  content: string;
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
  message: ApiMessage;
  sender_name: string;
};

export type Notification =
  | JoinGroupNotification
  | QuitGroupNotification
  | MessageNotification;
