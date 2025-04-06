import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { IconButton } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";

type AddUserDialogProps = {
  onAddUser: (username: string) => Promise<void>; // Callback when a user is added
  groupName: string;
};

export default function AddUserDialog({
  onAddUser,
  groupName,
}: AddUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setUsername(e.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setUsername("");
    setOpen(false);
  };

  const handleCreateGroup: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    onAddUser(username);
    handleClose();
  };

  return (
    <React.Fragment>
      <IconButton onClick={handleClickOpen}>
        <PersonAdd />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add user to {groupName}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Username"
            fullWidth
            variant="standard"
            value={username}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateGroup}>Add</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
