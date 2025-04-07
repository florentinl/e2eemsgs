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

  useEffect(() => {
    // Initialize group state
    fetchGroups()
      .then((groupMap) => {
        if (groupMap) setGroups(groupMap);
      })
      .then(() => {
        fetchMessages().then((messages) => {
          if (!messages) return;
          setGroups((groups) => {
            const newGroups = new Map(groups);
            for (const message of messages) {
              const group = newGroups.get(message.message.group_id);
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
                content: decrypted,
              });
            }
            return newGroups;
          });
        });
      });

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
          fetchGroups().then((groupMap) => {
            if (groupMap) setGroups(groupMap);
          });
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
              content: clearMessage,
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
