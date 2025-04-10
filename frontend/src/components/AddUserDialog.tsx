import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete, IconButton } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { getAllUsersApiUsersAllGet, type User } from "../api-client";

type AddUserDialogProps = {
  onAddUser: (username: string) => Promise<void>; // Callback when a user is added
  groupName: string;
};

export default function AddUserDialog({
  onAddUser,
  groupName,
}: AddUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [username, setUsername] = React.useState("");

  const handleChange = (_e: React.SyntheticEvent, newValue: string) => {
    setUsername(newValue);
  };

  const handleClickOpen = async () => {
    const response = await getAllUsersApiUsersAllGet();
    if (!response.data) {
      return;
    }
    setUsers(response.data);
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
          <Autocomplete
            getOptionLabel={(user) => user.username}
            onInputChange={handleChange}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                required
                margin="dense"
                id="name"
                name="name"
                label="Username"
                fullWidth
                variant="standard"
                value={username}
              />
            )}
            options={users}
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
