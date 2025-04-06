import { Box } from "@mui/material";
import { useState } from "react";
import ChatTopBar from "../components/ChatTopBar";
import GroupSidebar from "../components/GroupSideBar";
import MessageInput from "../components/MessageInput";
import MessageDisplay from "../components/Message";
import { useWebSocket } from "../hooks/websockets";
import LoadingPage from "./LoadingPage";
import type { User, Group } from "../types";

const ChatPage: React.FC<{}> = () => {
  const { groups, sendMessage, isConnected } = useWebSocket();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string>("");

  // Local states of groups
  const [localGroups, setLocalGroups] = useState(groups);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    const group = Array.from(groups.entries()).find(
      ([_, g]) => g.id === groupId
    );
    if (group) setGroupId(group[0]);
  };

  const handleCreateGroup = async (groupId: string, groupName: string) => {
    console.log("Creation of group:", { groupId, groupName });

    const symmetricKey = "here-is-a-key";

    const newGroup: Group = {
      id: groupId,
      name: groupName,
      symmetricKey: symmetricKey,
      members: new Set<User>(),
      messages: [],
    };

    const updatedGroups = new Map(localGroups);
    updatedGroups.set(groupId, newGroup);
    setLocalGroups(updatedGroups);
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
        groups={localGroups}
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
              onBack={() => {}}
              onSettings={() => {}}
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
