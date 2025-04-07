import {
  handleGetUserGroupsApiGroupsGet,
  type OwnGroupInfo,
} from "../api-client";
import type { Groups } from "../types";

export const fetchGroups = async () => {
  console.log("fetching groups...");
  const response = await handleGetUserGroupsApiGroupsGet();

  if (response.error) {
    console.error("Error while fetching groups");
    return;
  }

  const data: OwnGroupInfo[] = response.data!.groups;

  const groupMap: Groups = new Map();
  data.forEach((group) =>
    groupMap.set(group.group_id.toString(), {
      id: group.group_id.toString(),
      name: group.group_name,
      symmetricKey: group.symmetric_key,
      members: new Set(),
      messages: [],
    })
  );
  return groupMap;
};
