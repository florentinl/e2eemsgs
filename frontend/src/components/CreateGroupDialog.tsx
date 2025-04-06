import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

type CreateGroupDialogProps = {
  onCreateGroup: (groupName: string) => void; // Callback when a group is created
};

export default function CreateGroupDialog({
  onCreateGroup,
}: CreateGroupDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [groupName, setGroupName] = React.useState("");

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setGroupName(e.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setGroupName("");
    setOpen(false);
  };

  const handleCreateGroup: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    onCreateGroup(groupName);
    handleClose();
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Create new group
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create new group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Group name"
            fullWidth
            variant="standard"
            value={groupName}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateGroup}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
