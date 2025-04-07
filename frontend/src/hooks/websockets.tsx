import { useEffect, useRef, useState } from "react";
import type { Groups, Notification, SendMessage } from "../types";
import { useNavigate } from "@tanstack/react-router";
import { fetchGroups } from "../lib/groups";

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
    fetchGroups().then((groupMap) => {
      if (groupMap) setGroups(groupMap);
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

  // Function to send a message
  const sendMessage = (message: SendMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, message not sent.");
    }
  };

  return { groups, setGroups, isConnected, sendMessage };
};
