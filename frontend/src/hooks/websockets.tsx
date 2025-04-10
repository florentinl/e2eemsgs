import { useEffect, useRef, useState } from "react";
import type { Groups, Notification, Message } from "../types";
import { useNavigate } from "@tanstack/react-router";
import { fetchGroups } from "../lib/groups";
import { sym_decrypt } from "argon2wasm";
import { fetchMessages } from "../lib/messages";

const WS_URL = `${window.location.protocol === "https:" ? "wss://" : "ws://"}${
  window.location.host
}/api/ws/`;

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Groups>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  const refetchGroupsAndMessages = async () => {
    fetchGroups().then((groupMap) => {
      if (!groupMap) return;
      fetchMessages().then((messages) => {
        if (!messages) return;
        for (const message of messages) {
          const group = groupMap.get(message.message.group_id);
          if (!group) continue;

          const decrypted = sym_decrypt(
            {
              nonce: message.message.nonce,
              message: message.message.content,
            },
            group.symmetricKey
          );

          group.messages.set(message.message.id!, {
            id: message.message.id!,
            sender_name: message.sender_name,
            content: {
              id: message.message.id!,
              content: decrypted,
              attachment: message.message.attachment,
              nonce: message.message.nonce,
              sender_id: message.message.sender_id,
              group_id: message.message.group_id,
            },
          });
        }
        setGroups(groupMap);
      });
    });
  };

  useEffect(() => {
    // Initialize group state
    refetchGroupsAndMessages();

    // Function to create a WebSocket connection
    const connectWebSocket = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        const notification = JSON.parse(event.data) as Notification;
        if (notification.type == "joinedGroupNotification") {
          console.log("Received message:", notification);
          refetchGroupsAndMessages();
        }
        if (notification.type == "messageNotification") {
          console.log("Received message:", notification);
          setGroups((groups) => {
            const newGroups = new Map(groups);
            const msg = notification.message;
            const group = newGroups.get(notification.message.group_id)!;
            console.log("Member of group, ", group, groups);

            const clearMessage = sym_decrypt(
              {
                nonce: msg.nonce,
                message: msg.content,
              },
              group.symmetricKey
            );

            const message: Message = {
              id: msg.id!,
              sender_name: notification.sender_name,
              content: {
                id: msg.id!,
                content: clearMessage,
                attachment: msg.attachment,
                nonce: msg.nonce,
                sender_id: msg.sender_id,
                group_id: msg.group_id,
              },
            };

            group.messages.set(message.id, message);
            return newGroups;
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = (event) => {
        if (event.code == 3000) {
          navigate({ to: "/login" });
        }
        setIsConnected(false);
      };
    };
    connectWebSocket();

    return () => {
      ws.current?.close();
    };
  }, []);

  return { groups, setGroups, isConnected };
};
