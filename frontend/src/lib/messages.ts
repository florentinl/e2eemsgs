import { getGroupMessagesApiMessagesGet } from "../api-client";

export const fetchMessages = async () => {
  const response = await getGroupMessagesApiMessagesGet();
  if (response.error !== undefined) return;

  return response.data;
};
