import * as React from "react";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, IconButton, List, ListItem, ListItemText } from "@mui/material";
import { Delete, Menu, PersonAdd } from "@mui/icons-material";
import { getGroupUsersApiGroupsUsersGet, type User } from "../api-client";

type ChatMenuDialogProps = {
  groupId: number;
  onAddUser: (username: string) => Promise<void>; // Callback when a user is added
};

export default function ChatMenuDialog({
  groupId,
  onAddUser,
}: ChatMenuDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setUsername(e.target.value);
  };

  const handleClickOpen = async () => {
    const response = await getGroupUsersApiGroupsUsersGet({
      query: {
        group_id: groupId,
      },
    });

    if (response.data) setUsers(response.data);

    setOpen(true);
  };

  const handleClose = () => {
    setUsername("");
    setOpen(false);
  };

  const handleAddUser: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    onAddUser(username);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClickOpen}>
        <Menu />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle align="center">Manage users</DialogTitle>
        <DialogContent>
          <List>
            {users.map((user) => (
              <ListItem
                secondaryAction={
                  <IconButton edge="end" disabled={true}>
                    {" "}
                    {/* TODO: Handle quitting groups */}
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Box sx={{ display: "flex" }}>
            <TextField
              autoFocus
              required
              margin="dense"
              label="add new user"
              fullWidth
              variant="standard"
              value={username}
              onChange={handleChange}
            />
            <IconButton onClick={handleAddUser}>
              <PersonAdd />
            </IconButton>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
