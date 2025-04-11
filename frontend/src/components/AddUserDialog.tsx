import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete, IconButton, Typography } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { getAllUsersApiUsersAllGet, type User } from "../api-client";
import type { Group } from "../types";

type AddUserDialogProps = {
  onAddUser: (usernames: string[]) => Promise<void>; // Callback when a user is added
  group: Group;
};

export default function AddUserDialog({
  onAddUser,
  group,
}: AddUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [usernames, setUsernames] = React.useState<string[]>([]);
  console.log(usernames);

  const handleChange = (_e: React.SyntheticEvent, value: User[]) => {
    setUsernames(value.map((u) => u.username));
  };

  const handleClickOpen = async () => {
    const response = await getAllUsersApiUsersAllGet({
      query: {
        group_id: group.id,
      },
    });
    if (!response.data) {
      return;
    }
    setUsers(response.data);
    setOpen(true);
  };

  const handleClose = () => {
    setUsernames([]);
    setOpen(false);
  };

  const handleCreateGroup: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    onAddUser(usernames);
    handleClose();
  };

  return (
    <React.Fragment>
      <IconButton onClick={handleClickOpen}>
        <PersonAdd />
      </IconButton>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle sx={{ display: "flex" }}>
          <Typography fontSize={"1.5em"}>Add users to&nbsp;</Typography>
          <Typography fontSize={"1.5em"} color="secondary">
            {group.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            getOptionLabel={(user) => user.username}
            onChange={handleChange}
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
                value={usernames}
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
