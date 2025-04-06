import { Box, IconButton, Typography, AppBar, Toolbar } from "@mui/material";
import { ArrowBack, Settings } from "@mui/icons-material";
import AddUserDialog from "./AddUserDialog";

type ChatTopBarProps = {
  groupName: string; // The name of the currently selected group
  groupId: string;
  onBack: () => void; // Callback for back button (if needed)
  onSettings: () => void; // Callback for settings button (if needed)
  onAddUser: (username: string) => Promise<void>; // Callback for adding user
};

export default function ChatTopBar({
  groupName,
  onBack,
  onAddUser,
  onSettings,
}: ChatTopBarProps) {
  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" color="inherit">
            {groupName}
          </Typography>
        </Box>
        <Box>
          <AddUserDialog onAddUser={onAddUser} groupName={groupName} />
          <IconButton color="inherit" onClick={onSettings}>
            <Settings />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
