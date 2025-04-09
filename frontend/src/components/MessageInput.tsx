import { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  styled,
  Chip,
} from "@mui/material";
import { Send, AttachFile } from "@mui/icons-material";

type MessageInputProps = {
  onSend: (message: string, file: File | null) => void; // Callback function to send the message
  maxLength: number; // Maximum character limit
  message: string;
  setMessage: (message: string) => void;
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function MessageInput({
  onSend,
  maxLength,
  message,
  setMessage,
}: MessageInputProps) {
  const [error, setError] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDelete = () => {
    setFile(null);
  };

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
      onSend(message, file);
      setMessage(""); // Clear input field after sending
      setFile(null); // Clear file after sending
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <TextField
        variant="outlined"
        placeholder="Type a message"
        fullWidth
        multiline
        value={message}
        onChange={handleChange}
        error={!!error}
        helperText={error || `${message.length}/${maxLength}`}
        slotProps={{
          input: {
            onKeyDown: (event) => {
              if (!event.shiftKey && event.key == "Enter") {
                event.preventDefault();
                handleSend();
              }
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton component="label" role={undefined} tabIndex={-1}>
                  <AttachFile />
                  <VisuallyHiddenInput
                    type="file"
                    onChange={handleFileChange}
                    multiple
                  />
                </IconButton>
                <IconButton
                  onClick={handleSend}
                  disabled={message.trim() === "" || message.length > maxLength}
                >
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                {file == null ? (
                  <></>
                ) : (
                  <Chip
                    label={file.name}
                    onDelete={handleDelete}
                    style={{ maxWidth: 100 }}
                  />
                )}
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}
