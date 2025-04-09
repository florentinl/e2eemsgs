import { Card, CardContent, Chip, Typography } from "@mui/material";
import { type User } from "../api-client";
import type { Message } from "../types";
import { Download } from "@mui/icons-material";

export type MessageProps = {
  msg: Message;
  self: User;
  handleDownload: (msg: Message) => void;
};

const MessageDisplay = ({ msg, self, handleDownload }: MessageProps) => {
  return (
    <Card
      sx={{
        my: 1,
        maxWidth: "75%",
        width: "fit-content",
        ...(self.username === msg.sender_name
          ? { backgroundColor: "rgb(135,117,218)" }
          : {}),
      }}
    >
      <CardContent>
        {self.username !== msg.sender_name && (
          <Typography variant="subtitle2" color="textSecondary">
            {msg.sender_name}
          </Typography>
        )}
        {msg.content.attachment == null ? (
          <></>
        ) : (
          <Chip
            label={msg.content.attachment.pretty_name}
            style={{ maxWidth: 100 }}
            onDelete={() => handleDownload(msg)}
            deleteIcon={<Download />}
          />
        )}
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {msg.content.content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MessageDisplay;
