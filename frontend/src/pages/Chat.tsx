import { Box } from "@mui/material";
import { useState } from "react";
import ChatTopBar from "../components/ChatTopBar";
import GroupSidebar from "../components/GroupSideBar";
import MessageInput from "../components/MessageInput";
import MessageDisplay from "../components/Message";
import { useWebSocket } from "../hooks/websockets";
import LoadingPage from "./LoadingPage";
import { asym_encrypt, generate_sym_key, sym_encrypt } from "argon2wasm";
import {
  handleAddGroupUserApiGroupsAddPost,
  handleCreateGroupApiGroupsCreatePost,
  handleGetUserApiUsersGet,
  sendMessageApiMessagesPost,
} from "../api-client";

const ChatPage: React.FC<{}> = () => {
  const { groups, isConnected } = useWebSocket();
  const [groupId, setGroupId] = useState<number>();

  const messages = Array.from(
    groups.get(groupId ?? 0)?.messages.values() ?? []
  );

  console.log(messages);

  const handleCreateGroup = async (groupName: string) => {
    console.log("Creation of group:", { groupName });
    const publicKey = localStorage.getItem("publicKey");
    if (publicKey) {
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
    if (groupId === undefined) return;

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
      if (currSymKey && userResponse.data.id && groupId) {
        const ciphered_symKey = asym_encrypt(
          currSymKey,
          userResponse.data.public_key
        );

        const addResponse = await handleAddGroupUserApiGroupsAddPost({
          body: {
            user_id: userResponse.data.id,
            group_id: groupId,
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
    if (groupId === undefined) return;

    const key = groups.get(groupId)?.symmetricKey!;

    const encryptedMessage = sym_encrypt(message, key);

    console.log(encryptedMessage);
    sendMessageApiMessagesPost({
      body: {
        content: encryptedMessage.message,
        nonce: encryptedMessage.nonce,
        group_id: groupId,
      },
    });
  };

  return !isConnected ? (
    <LoadingPage />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      {/* Sidebar */}
      <GroupSidebar
        groups={groups}
        onSelect={(groupId) => setGroupId(groupId)}
        onCreateGroup={handleCreateGroup}
      />
      {/* Main Layout */}
      {!groupId ? (
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
            {messages.map((message) => (
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
