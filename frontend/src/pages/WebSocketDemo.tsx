import { Box } from "@mui/material";
import { useWebSocket } from "../hooks";

const WebSocketDemo = () => {
  const { sendMessage, lastMessage, isConnected } = useWebSocket();

  return (
    <Box>
      <Box>
        <h1>WebSocket Demo</h1>
        <p>Connected: {isConnected ? "Yes" : "No"}</p>
      </Box>

      <Box>
        <h2>Send Message</h2>
        <button onClick={() => sendMessage({ type: "ping" })}>Ping</button>
        <button onClick={() => sendMessage({ type: "pong" })}>Pong</button>
      </Box>

      <Box>
        <h2>Last Message</h2>
        <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
      </Box>
    </Box>
  );
};

export default WebSocketDemo;
