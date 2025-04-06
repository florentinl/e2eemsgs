import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import ChatTopBar from "../components/ChatTopBar";
import GroupSidebar from "../components/GroupSideBar";
import MessageInput from "../components/MessageInput";
import MessageDisplay from "../components/Message";
import { useWebSocket } from "../hooks/websockets";
import LoadingPage from "./LoadingPage";
import type { Group } from "../types";
import { useCryptoWasmReady } from "../hooks/cryptoWasm";
import { asym_encrypt, generate_sym_key } from "argon2wasm";
import {
  handleAddGroupUserApiGroupsAddPost,
  handleCreateGroupApiGroupsCreatePost,
  handleGetUserApiUsersGet,
  handleGetUserGroupsApiGroupsPost,
  type OwnGroupInfo,
} from "../api-client";

const ChatPage: React.FC<{}> = () => {
  const { sendMessage, isConnected } = useWebSocket();
  const { initialized } = useCryptoWasmReady();
  const [groups, setGroups] = useState<Map<string, Group>>(new Map());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string>("");

  const fetchGroups = async () => {
    try {
      const response = await handleGetUserGroupsApiGroupsPost({});

      if (response.error || !response.data) {
        console.error("Error while fetching groups");
        return;
      } else {
        const data: OwnGroupInfo[] = response.data.groups;

        const groupMap = new Map<string, Group>();
        data.forEach((group) =>
          groupMap.set(group.group_id.toString(), {
            id: group.group_id.toString(),
            name: group.group_name,
            symmetricKey: group.symmetric_key,
            members: new Set(),
            messages: [],
          })
        );

        setGroups(groupMap);
      }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    const group = Array.from(groups.entries()).find(
      ([_, g]) => g.id === groupId
    );
    if (group) setGroupId(group[0]);
  };

  const handleCreateGroup = async (groupName: string) => {
    console.log("Creation of group:", { groupName });
    const publicKey = localStorage.getItem("publicKey");
    if (initialized && publicKey) {
      const symmetricKey = generate_sym_key();
      const ciphered_symKey = asym_encrypt(symmetricKey, publicKey);
      try {
        const response = await handleCreateGroupApiGroupsCreatePost({
          body: {
            name: groupName,
            symmetric_key: ciphered_symKey,
          },
        });

        if (response.error) {
          console.error(
            "Error while creating the group: ",
            response.error.detail
          );
          return;
        }
      } catch (err) {
        console.error("Error while creating the group", err);
      }
    }
  };

  const handleAddUser = async (username: string) => {
    const currGroupName = groups.get(groupId)?.name || "Select a group";
    const currSymKey = groups.get(groupId)?.symmetricKey;
    console.log("Adding user", { username }, "to group ", { currGroupName });
    try {
      const userResponse = await handleGetUserApiUsersGet({
        query: {
          username: username,
        },
      });
      if (userResponse.error) {
        if (userResponse.response.status == 404) {
          console.error("User does not exist");
          return;
        } else {
          console.error("Internal server error");
          return;
        }
      }
      if (
        initialized &&
        currSymKey &&
        userResponse.data.id &&
        parseInt(groupId)
      ) {
        const ciphered_symKey = asym_encrypt(
          currSymKey,
          userResponse.data.public_key
        );

        const addResponse = await handleAddGroupUserApiGroupsAddPost({
          body: {
            user_id: userResponse.data.id,
            group_id: parseInt(groupId),
            symmetric_key: ciphered_symKey,
          },
        });
        if (addResponse.error) {
          if (addResponse.response.status == 403) {
            console.error("Not allowed to add user");
            return;
          } else {
            console.error("Internal server error");
            return;
          }
        }
        console.log("Successfully added user");
      }
    } catch (err) {
      console.error("Error while creating the group", err);
    }
  };

  const handleSendMessage = (message: string) => {
    sendMessage({
      groupId: selectedGroupId!,
      content: message,
    });
  };

  return !isConnected ? (
    <LoadingPage />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      {/* Sidebar */}
      <GroupSidebar
        groups={groups}
        onSelect={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
      />
      {/* Main Layout */}
      {!selectedGroupId ? (
        <Box></Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: "100vh",
          }}
        >
          {/* Top Bar */}
          <Box sx={{ mx: 2 }}>
            <ChatTopBar
              groupName={groups.get(groupId)?.name || "Select a group"}
              groupId={groupId}
              onBack={() => {}}
              onSettings={() => {}}
              onAddUser={handleAddUser}
            />
          </Box>

          {/* Message List */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              padding: 2,
              my: 2,
            }}
          >
            {groups.get(groupId)?.messages.map((message) => (
              <MessageDisplay key={message.id} msg={message}></MessageDisplay>
            ))}
          </Box>

          {/* Message Entry Field */}
          <Box sx={{ alignItems: "flex-end" }}>
            <MessageInput onSend={handleSendMessage} maxLength={500} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatPage;
