import { Box, Typography, AppBar, Toolbar, IconButton } from "@mui/material";
import AddUserDialog from "./AddUserDialog";
import GroupMemberMenu from "./GroupMembersMenu";
import { Menu } from "@mui/icons-material";
import type { Group } from "../types";

type ChatTopBarProps = {
  group: Group | null;
  userId: number;
  onAddUser?: (username: string) => Promise<void>; // Callback for adding user
  handleDrawerToggle: () => void;
};

export default function ChatTopBar({
  group,
  userId,
  onAddUser,
  handleDrawerToggle,
}: ChatTopBarProps) {
  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <Menu />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" color="inherit">
            {group?.name || ""}
          </Typography>
        </Box>
        {group && onAddUser && (
          <Box display={"flex"}>
            {group.ownerId == userId && (
              <AddUserDialog onAddUser={onAddUser} groupName={group.name} />
            )}
            <GroupMemberMenu group_id={group.id || -1} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
