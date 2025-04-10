import { asym_decrypt } from "argon2wasm";
import {
  handleGetUserGroupsApiGroupsGet,
  type OwnGroupInfo,
} from "../api-client";
import type { Groups } from "../types";

export const fetchGroups = async () => {
  console.log("fetching groups...");
  const response = await handleGetUserGroupsApiGroupsGet();
  console.log(response);

  if (response.error) {
    console.error("Error while fetching groups");
    return;
  }

  const data: OwnGroupInfo[] = response.data!.groups;
  const privateKey = localStorage.getItem("privateKey")!;

  const groupMap: Groups = new Map();
  data.forEach((group) => {
    const decryptedGroupKey = asym_decrypt(group.symmetric_key, privateKey);
    groupMap.set(group.group_id, {
      id: group.group_id,
      ownerId: group.owner_id,
      name: group.group_name,
      symmetricKey: decryptedGroupKey,
      members: new Set(),
      messages: new Map(),
    });
  });
  console.log(groupMap);
  return groupMap;
};
