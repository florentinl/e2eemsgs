import { Card, CardContent, Typography } from "@mui/material";
import type { Message } from "../types";

export type MessageProps = {
  msg: Message;
};

const MessageDisplay = ({ msg }: MessageProps) => {
  return (
    <Card
      sx={{
        my: 1,
        maxWidth: "75%",
        width: "fit-content",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary">
          {msg.sender_name}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
          {msg.content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MessageDisplay;
