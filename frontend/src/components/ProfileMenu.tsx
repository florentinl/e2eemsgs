import * as React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton } from "@mui/material";
import { Settings } from "@mui/icons-material";
import {
  handleEditProfileApiUsersEditProfilePost,
  whoamiApiSessionWhoamiGet,
} from "../api-client";
import UserProfileDialog from "./UserProfileDialog";
import EditProfileDialog from "./EditProfileDialog";

export default function ProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [username, setUsername] = React.useState<null | string>(null);
  const [description, setDescription] = React.useState<
    undefined | null | string
  >(undefined);
  const [socialLink, setSocialLink] = React.useState<undefined | null | string>(
    undefined
  );

  React.useEffect(() => {
    whoamiApiSessionWhoamiGet().then((response) => {
      if (response.error || !response.data) {
        console.error("Error while fetching self");
        return;
      }
      setUsername(response.data.username);
      setDescription(response.data.description);
      setSocialLink(response.data.social_link);
    });
  }, []);

  const handleEditProfile = (description: string, socialLink: string) => {
    handleEditProfileApiUsersEditProfilePost({
      body: {
        description: description,
        social_link: socialLink,
      },
    }).then((response) => {
      if (response.error || !response.data) {
        console.error("Error while fetching self");
        return;
      }
      setUsername(response.data.username);
      setDescription(response.data.description);
      setSocialLink(response.data.social_link);
      return;
    });
  };

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? "grouped-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Settings />
      </IconButton>
      <Menu
        id="grouped-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <ListSubheader>{username}</ListSubheader>
        <UserProfileDialog
          username={username}
          description={description}
          socialLink={socialLink}
        />
        <EditProfileDialog
          initialDescription={description}
          initialSocialLink={socialLink}
          handleEditProfile={handleEditProfile}
        />
        <MenuItem>Logout</MenuItem>
      </Menu>
    </div>
  );
}
