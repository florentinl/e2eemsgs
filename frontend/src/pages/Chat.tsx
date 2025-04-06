import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import ChatTopBar from "../components/ChatTopBar";
import GroupSidebar from "../components/GroupSideBar";
import MessageInput from "../components/MessageInput";
import MessageDisplay from "../components/Message";
import { useWebSocket } from "../hooks/websockets";
import LoadingPage from "./LoadingPage";
import type { Group } from "../types";

const ChatPage: React.FC<{}> = () => {
  const { sendMessage, isConnected } = useWebSocket();
  const [groups, setGroups] = useState<Map<string, Group>>(new Map());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string>("");

  const username = "alicebob"; // -> get username of currently authenticated user

  const fetchGroups = async () => {
    try {
      const res = await fetch(`/api/groups/me?username=${username}`);
      if (!res.ok) throw new Error("Failed to fetch groups");

      const data: Group[] = await res.json();

      const groupMap = new Map<string, Group>();
      data.forEach((group) => groupMap.set(group.id.toString(), group));

      setGroups(groupMap);
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

  const handleCreateGroup = async (groupId: string, groupName: string) => {
    console.log("Creation of group:", { groupId, groupName });

    const symmetricKey = "here-is-a-key";

    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name: groupName,
          symmetric_key: symmetricKey,
        }),
      });

      if (!res.ok) throw new Error("Error while creating the group");
      await fetchGroups();
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
