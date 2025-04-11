import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  Typography,
} from "@mui/material";
import { type User } from "../api-client";
import type { Message } from "../types";
import { Download } from "@mui/icons-material";
import { useEffect, useState } from "react";

export type MessageProps = {
  msg: Message;
  self: User;
  handleDownload: (msg: Message) => void;
  getDecryptedFile: (msg: Message) => Promise<Blob | null>;
};

const MessageDisplay = ({
  msg,
  self,
  handleDownload,
  getDecryptedFile,
}: MessageProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(
    msg.content.attachment?.pretty_name.split(".").pop() || ""
  );

  useEffect(() => {
    if (!isImage) return;
    getDecryptedFile(msg).then((blob_) =>
      setImageUrl((blob_ && window.URL.createObjectURL(blob_)) ?? undefined)
    );
  }, [isImage, msg]);

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
      {isImage && (
        <>
          <CardMedia
            sx={{ height: 140 }}
            image={imageUrl}
            onClick={() => setImagePreviewOpen(true)}
            title="green iguana"
          />
          {imagePreviewOpen && (
            <Dialog
              open={imagePreviewOpen}
              onClose={() => setImagePreviewOpen(false)}
            >
              <img src={imageUrl}></img>
            </Dialog>
          )}
        </>
      )}
      <CardContent>
        {self.username !== msg.sender_name && (
          <Typography variant="subtitle2">{msg.sender_name}</Typography>
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
