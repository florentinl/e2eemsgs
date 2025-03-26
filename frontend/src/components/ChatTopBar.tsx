import { Box, IconButton, Typography, AppBar, Toolbar } from "@mui/material";
import { ArrowBack, Settings } from "@mui/icons-material";

type ChatTopBarProps = {
  groupName: string; // The name of the currently selected group
  onBack: () => void; // Callback for back button (if needed)
  onSettings: () => void; // Callback for settings button (if needed)
};

export default function ChatTopBar({
  groupName,
  onBack,
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
        <IconButton edge="end" color="inherit" onClick={onSettings}>
          <Settings />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
