import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { MenuItem, TextField } from "@mui/material";

type EditProfileDialogProps = {
  initialDescription: string | null | undefined;
  initialSocialLink: string | null | undefined;
  handleEditProfile: (description: string, socialLink: string) => void; // Callback for profile editing
};

export default function EditProfileDialog({
  initialDescription,
  initialSocialLink,
  handleEditProfile,
}: EditProfileDialogProps) {
  const [profile, setProfile] = React.useState({
    description: initialDescription ? initialDescription : "",
    socialLink: initialSocialLink ? initialSocialLink : "",
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const [open, setOpen] = React.useState<boolean>(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // Here to prevent some weird ahh behaviour.
  // MUI is cursed when it comes to textfields inside of menu items specifically
  // https://github.com/mui/material-ui/issues/19116
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <React.Fragment>
      <MenuItem onClick={handleOpen}>Edit Profile</MenuItem>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            name="description"
            margin="normal"
            variant="standard"
            onKeyDown={onKeyDown}
            value={profile.description}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Social Link"
            name="socialLink"
            margin="normal"
            variant="standard"
            onKeyDown={onKeyDown}
            value={profile.socialLink}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              handleEditProfile(profile.description, profile.socialLink)
            }
          >
            Edit
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
