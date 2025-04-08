import { Box, Typography, AppBar, Toolbar } from "@mui/material";
import AddUserDialog from "./AddUserDialog";
import GroupMemberMenu from "./GroupMembersMenu";

type ChatTopBarProps = {
  groupName: string; // The name of the currently selected group
  groupId: number;
  onAddUser: (username: string) => Promise<void>; // Callback for adding user
};

export default function ChatTopBar({
  groupName,
  onAddUser,
  groupId,
}: ChatTopBarProps) {
  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" color="inherit">
            {groupName}
          </Typography>
        </Box>
        <Box display={"flex"}>
          <AddUserDialog onAddUser={onAddUser} groupName={groupName} />
          <GroupMemberMenu group_id={groupId} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
