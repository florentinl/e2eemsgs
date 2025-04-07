import { Card, CardContent, Typography } from "@mui/material";
import type { Message } from "../types";
import type { User } from "../api-client";

export type MessageProps = {
  msg: Message;
  self: User;
};

const MessageDisplay = ({ msg, self }: MessageProps) => {
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
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {msg.content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MessageDisplay;
