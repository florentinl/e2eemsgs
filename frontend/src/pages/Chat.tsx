import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import ChatTopBar from "../components/ChatTopBar";
import GroupSidebar from "../components/GroupSideBar";
import MessageInput from "../components/MessageInput";
import MessageDisplay from "../components/Message";
import { useWebSocket } from "../hooks/websockets";
import LoadingPage from "./LoadingPage";
import {
  asym_encrypt,
  generate_sym_key,
  sym_decrypt_bytes,
  sym_encrypt,
  sym_encrypt_bytes,
} from "argon2wasm";
import {
  downloadApiMessagesDownloadPost,
  handleAddGroupUserApiGroupsAddPost,
  handleCreateGroupApiGroupsCreatePost,
  handleGetUserByUsernameApiUsersUsernameGet,
  sendMessageApiMessagesPost,
  uploadApiMessagesUploadPost,
  whoamiApiSessionWhoamiGet,
  type User,
} from "../api-client";
import type { Message } from "../types";

const ChatPage: React.FC<{}> = () => {
  const { groups, isConnected, setGroups } = useWebSocket();
  const [groupId, setGroupId] = useState<number>();
  const [user, setUser] = useState<User>();

  const [pendingMessage, setPendingMessage] = useState("");

  const messages = Array.from(
    groups.get(groupId ?? 0)?.messages.values() ?? []
  );

  useEffect(() => {
    whoamiApiSessionWhoamiGet().then(({ data }) => {
      if (data) setUser(data);
    });
  }, []);

  const handleSelectGroup = async (newGroupId: number) => {
    // Save current pendingMessage as draft in previous groupId
    if (groupId) {
      const newGroups = new Map(groups);
      newGroups.set(groupId, {
        ...newGroups.get(groupId)!,
        draft: pendingMessage,
      });
      setGroups(newGroups);
    }

    // Restore draft as pendingMessage in new groupId
    setPendingMessage(groups.get(newGroupId)?.draft || "");

    setGroupId(newGroupId);
  };

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
      const userResponse = await handleGetUserByUsernameApiUsersUsernameGet({
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

  const handleSendMessage = (message: string, file: File | null) => {
    if (groupId === undefined) return;

    const key = groups.get(groupId)?.symmetricKey!;

    const encryptedMessage =
      message.length == 0
        ? { message: "", nonce: "" }
        : sym_encrypt(message, key);

    if (file == null) {
      console.log(encryptedMessage);
      sendMessageApiMessagesPost({
        body: {
          content: encryptedMessage.message,
          nonce: encryptedMessage.nonce,
          group_id: groupId,
          has_attachment: false,
        },
      });
    } else {
      file
        .bytes()
        .then((content) => {
          return sym_encrypt_bytes(content, key);
        })
        .then((encryptedFile) => {
          const encrFile = new File([encryptedFile.message], file.name);
          uploadApiMessagesUploadPost({
            body: {
              file: encrFile,
              group_id: groupId,
              message: encryptedMessage.message,
              message_nonce: encryptedMessage.nonce,
              file_nonce: encryptedFile.nonce,
            },
          });
        });
    }
  };

  const handleDownload = (msg: Message) => {
    if (groupId === undefined) return;
    const key = groups.get(groupId)?.symmetricKey!;

    downloadApiMessagesDownloadPost({
      body: {
        message_id: msg.id,
      },
    })
      .then((response) => {
        return (response.data as Blob).text();
      })
      .then((stringContent) => {
        if (msg.content.attachment == null) {
          return;
        } else {
          const clearFile = sym_decrypt_bytes(
            {
              nonce: msg.content.attachment.nonce,
              message: stringContent,
            },
            key
          );

          var url = window.URL.createObjectURL(new Blob([clearFile]));
          var a = document.createElement("a");
          a.href = url;
          a.download =
            msg.content.attachment == null
              ? "new_file"
              : msg.content.attachment.pretty_name;
          document.body.appendChild(a); // append the element to the dom
          a.click();
          a.remove();
        }
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
              groupId={groupId}
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
              <MessageDisplay
                key={message.id}
                msg={message}
                self={user!}
                handleDownload={handleDownload}
              ></MessageDisplay>
            ))}
          </Box>

          {/* Message Entry Field */}
          <Box sx={{ alignItems: "flex-end" }}>
            <MessageInput
              onSend={handleSendMessage}
              maxLength={500}
              message={pendingMessage}
              setMessage={setPendingMessage}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatPage;
