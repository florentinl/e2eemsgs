import { Box, Typography, AppBar, Toolbar, IconButton } from "@mui/material";
import AddUserDialog from "./AddUserDialog";
import GroupMemberMenu from "./GroupMembersMenu";
import { Menu } from "@mui/icons-material";

type ChatTopBarProps = {
  groupName: string; // The name of the currently selected group
  groupId?: number;
  onAddUser?: (username: string) => Promise<void>; // Callback for adding user
  handleDrawerToggle: () => void;
};

export default function ChatTopBar({
  groupName,
  onAddUser,
  groupId,
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
            {groupName}
          </Typography>
        </Box>
        {groupId && onAddUser && (
          <Box display={"flex"}>
            <AddUserDialog onAddUser={onAddUser} groupName={groupName} />
            <GroupMemberMenu group_id={groupId} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
