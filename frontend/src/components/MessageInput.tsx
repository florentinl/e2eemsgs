import { useState } from "react";
import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import { Send } from "@mui/icons-material";

type MessageInputProps = {
  onSend: (message: string) => void; // Callback function to send the message
  maxLength: number; // Maximum character limit
};

export default function MessageInput({ onSend, maxLength }: MessageInputProps) {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length > maxLength) {
      setError(`Message cannot exceed ${maxLength} characters`);
    } else {
      setError("");
    }
    setMessage(newMessage);
  };

  const handleSend = () => {
    if (message.length <= maxLength && message.trim() !== "") {
      onSend(message);
      setMessage(""); // Clear input field after sending
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <TextField
        variant="outlined"
        placeholder="Type a message"
        fullWidth
        value={message}
        onChange={handleChange}
        error={!!error}
        helperText={error || `${message.length}/${maxLength}`}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSend}
                disabled={message.trim() === "" || message.length > maxLength}
              >
                <Send />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
