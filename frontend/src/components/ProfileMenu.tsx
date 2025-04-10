import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Box, IconButton, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
import {
  handleEditProfileApiUsersEditProfilePost,
  whoamiApiSessionWhoamiGet,
} from "../api-client";
import UserProfileDialog from "./UserProfileDialog";
import EditProfileDialog from "./EditProfileDialog";
import { logout } from "../lib/auth";
import { useNavigate } from "@tanstack/react-router";

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
  const [description, setDescription] = React.useState<string>();
  const [socialLink, setSocialLink] = React.useState<string>();

  const navigate = useNavigate();

  React.useEffect(() => {
    whoamiApiSessionWhoamiGet().then((response) => {
      if (response.error || !response.data) {
        console.error("Error while fetching self");
        return;
      }
      setUsername(response.data.username);
      setDescription(response.data.description ?? undefined);
      setSocialLink(response.data.social_link ?? undefined);
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
      setDescription(response.data.description ?? undefined);
      setSocialLink(response.data.social_link ?? undefined);
      return;
    });
  };

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      sx={{ backgroundColor: "#414141", minHeight: "64px" }}
    >
      <IconButton
        id="basic-button"
        aria-controls={open ? "grouped-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Person />
      </IconButton>
      <Typography variant="h6" sx={{ margin: "auto" }}>
        {"E2EEMSGS"}
      </Typography>
      <Menu
        id="grouped-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <UserProfileDialog
          username={username ?? undefined}
          description={description}
          socialLink={socialLink}
        />
        <EditProfileDialog
          initialDescription={description}
          initialSocialLink={socialLink}
          handleEditProfile={handleEditProfile}
        />
        <MenuItem
          onClick={() => {
            logout(navigate);
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
