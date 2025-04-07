import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { MenuItem, Typography } from "@mui/material";

type UserProfileDialogProps = {
  username: string | null;
  description: string | null | undefined;
  socialLink: string | null | undefined;
};

export default function UserProfileDialog({
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
      <MenuItem onClick={handleOpen}>View Profile</MenuItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{username}'s profile</DialogTitle>
        <DialogContent>
          <Typography>{description}</Typography>
          <Typography>{socialLink}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
