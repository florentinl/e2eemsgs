import { useEffect, useRef, useState } from "react";
import type { Groups, SendMessage } from "../types";
import { useNavigate } from "@tanstack/react-router";

const WS_URL = `${window.location.protocol === "https:" ? "wss://" : "ws://"}${
  window.location.host
}/api/ws/`;

const makeMessages = (n: number) => {
  const messages = [];
  for (let i = 0; i < n; i++) {
    messages.push({
      id: i.toString(),
      sender: {
        id: i.toString(),
        username: `User ${i}`,
        publickey: `PublicKey ${i}`,
      },
      content: `Message ${i}`,
    });
  }
  return messages;
};

const makeGroups: (n: number) => Groups = (n) => {
  const groups: Groups = new Map();
  for (let i = 1; i <= n; i++) {
    groups.set(i.toString(), {
      name: `Group ${i}`,
      id: i.toString(),
      symmetricKey: "",
      members: new Set(),
      messages: makeMessages(20),
    });
  }
  return groups;
};

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const [groups] = useState<Groups>(makeGroups(10));
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Function to create a WebSocket connection
    const connectWebSocket = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = (event) => {
        if (event.code == 3000) {
          navigate({ to: "/login" });
        }
        console.warn("WebSocket closed. Reconnecting...");
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
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

  return { groups, isConnected, sendMessage };
};
