import * as React from "react";
import Menu from "@mui/material/Menu";
import { IconButton } from "@mui/material";
import { People } from "@mui/icons-material";
import UserProfileDialog from "./UserProfileDialog";
import { handleGetGroupUsersApiGroupsUsersGet, type User } from "../api-client";

export default function PositionedMenu({ group_id }: { group_id: number }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [users, setUsers] = React.useState<User[]>();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    handleGetGroupUsersApiGroupsUsersGet({
      query: {
        group_id: group_id,
      },
    }).then(({ data, error }) => {
      if (error) {
        return;
      }
      setUsers(data);
    });
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="demo-positioned-button"
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <People />
      </IconButton>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {users?.map((user) => (
          <UserProfileDialog
            key={user.id}
            label={user.username}
            username={user.username}
            description={user.description ?? undefined}
            socialLink={user.social_link ?? undefined}
          />
        ))}
      </Menu>
    </div>
  );
}
