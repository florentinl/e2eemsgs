import { Box, IconButton, Typography, AppBar, Toolbar } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AddUserDialog from "./AddUserDialog";

type ChatTopBarProps = {
  groupName: string; // The name of the currently selected group
  onBack: () => void; // Callback for back button (if needed)
  onAddUser: (username: string) => Promise<void>; // Callback for adding user
};

export default function ChatTopBar({
  groupName,
  onBack,
  onAddUser,
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}
