import { Box, Typography, AppBar, Toolbar } from "@mui/material";
import ChatMenuDialog from "./ChatMenuDialog";

type ChatTopBarProps = {
  groupId: number; // The name of the currently selected group
  groupName: string;
  onAddUser: (username: string) => Promise<void>; // Callback for adding user
};

export default function ChatTopBar({
  groupName,
  groupId,
  onAddUser,
}: ChatTopBarProps) {
  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        <Typography variant="h6" color="inherit">
          {groupName}
        </Typography>
        <Box sx={{ marginLeft: "auto" }}>
          <ChatMenuDialog onAddUser={onAddUser} groupId={groupId} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
