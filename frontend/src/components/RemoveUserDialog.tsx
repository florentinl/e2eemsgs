import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Autocomplete, IconButton, Typography } from "@mui/material";
import { PersonRemove } from "@mui/icons-material";
import {
  handleGetGroupUsersApiGroupsUsersGet,
  whoamiApiSessionWhoamiGet,
  type User,
} from "../api-client";
import type { Group } from "../types";

type RemoveUserDialogProps = {
  onRemoveUser: (usernames: string[]) => Promise<void>;
  group: Group;
};

export default function RemoveUserDialog({
  onRemoveUser,
  group,
}: RemoveUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<User>();
  const [users, setUsers] = React.useState<User[]>([]);
  const [usernames, setUsernames] = React.useState<string[]>([]);

  React.useEffect(() => {
    whoamiApiSessionWhoamiGet().then(({ data }) => {
      if (data) setCurrentUser(data);
    });
  }, []);

  const handleChange = (_e: React.SyntheticEvent, value: User[]) => {
    setUsernames(value.map((u) => u.username));
  };

  const handleClickOpen = async () => {
    const response = await handleGetGroupUsersApiGroupsUsersGet({
      query: {
        group_id: group.id,
      },
    });
    if (!response.data) {
      return;
    }
    const filteredUsers = response.data.filter(
      (user) => user.id !== currentUser?.id
    );
    setUsers(filteredUsers);
    setOpen(true);
  };

  const handleClose = () => {
    setUsernames([]);
    setOpen(false);
  };

  const handleRemoveUser: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    onRemoveUser(usernames);
    handleClose();
  };

  return (
    <React.Fragment>
      <IconButton onClick={handleClickOpen}>
        <PersonRemove />
      </IconButton>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle sx={{ display: "flex" }}>
          <Typography fontSize={"1.5em"}>Remove users from&nbsp;</Typography>
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
          <Button onClick={handleRemoveUser}>Remove</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
