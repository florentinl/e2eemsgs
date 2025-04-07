import type {
  Group as ApiGroup,
  Message as ApiMessage,
} from "./api-client/types.gen";

export type Groups = Map<string, Group>;

export type Group = {
  id: string;
  name: string;
  symmetricKey: string;
  members: Set<User>;
  messages: Message[];
};

export type User = {
  id: string;
  username: string;
  publickey: string;
};

export type Message = {
  id: string;
  sender: User;
  content: string;
};

export type SendMessage = {
  groupId: string;
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
};

export type Notification =
  | JoinGroupNotification
  | QuitGroupNotification
  | MessageNotification;
