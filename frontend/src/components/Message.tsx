import { Card, CardContent, Chip, Typography } from "@mui/material";
import { downloadApiMessagesDownloadPost, type User } from "../api-client";
import type { Message } from "../types";
import { Download } from "@mui/icons-material";

export type MessageProps = {
  msg: Message;
  self: User;
};

const MessageDisplay = ({ msg, self }: MessageProps) => {
  const handleDownload = () => {
    downloadApiMessagesDownloadPost({
      body: {
        message_id: msg.id,
      },
    }).then((response) => {
      var url = window.URL.createObjectURL(response.data as Blob);
      var a = document.createElement("a");
      a.href = url;
      a.download =
        msg.content.attachment == null
          ? "new_file"
          : msg.content.attachment.pretty_name;
      document.body.appendChild(a); // append the element to the dom
      a.click();
      a.remove();
    });
  };

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
            onDelete={handleDownload}
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
