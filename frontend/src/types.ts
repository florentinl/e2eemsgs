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
