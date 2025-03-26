import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const WS_URL = `${window.location.protocol === "https:" ? "wss://" : "ws://"}${
  window.location.host
}/api/ws`;

interface WebSocketContextType {
  sendMessage: (message: object) => void;
  lastMessage: object;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<object>({});
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
        setLastMessage(data);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = () => {
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
  const sendMessage = (message: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, message not sent.");
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ sendMessage, lastMessage, isConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
