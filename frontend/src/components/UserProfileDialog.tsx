import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, IconButton, MenuItem } from "@mui/material";
import { Close, Link } from "@mui/icons-material";

type UserProfileDialogProps = {
  label?: string;
  username?: string;
  description?: string;
  socialLink?: string;
};

export default function UserProfileDialog({
  label,
  username,
  description,
  socialLink,
}: UserProfileDialogProps) {
  const [open, setOpen] = React.useState<boolean>(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <React.Fragment>
      <MenuItem onClick={handleOpen}>{label || "View Profile"}</MenuItem>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display={"flex"} gap={"1em"}>
            {username}
            {socialLink && (
              <a href={socialLink}>
                <Link />
              </a>
            )}
          </Box>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div dangerouslySetInnerHTML={{ __html: description || "" }}></div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
