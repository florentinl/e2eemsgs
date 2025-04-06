import { useState } from "react";
import { List, ListItem, ListItemText, Paper, Button, Box } from "@mui/material";
import type { Groups } from "../types";

type GroupSidebarProps = {
  groups: Groups;
  onSelect: (group: string) => void; // Callback when a group is selected
  onCreateGroup: (groupId: string, groupName: string) => void; // Callback when a group is created
};

export default function GroupSidebar({ groups, onSelect, onCreateGroup }: GroupSidebarProps) {
  const [selectedGroupId, setSelectedGroup] = useState<string | null>(null);

  const handleSelect = (group: string) => {
    setSelectedGroup(group);
    onSelect(group);
  };

  const handleCreateGroup = () => {
    const newGroupId = `group-${groups.size + 1}`;
    const newGroupName = `Group ${groups.size + 1}`;
    onCreateGroup(newGroupId, newGroupName);
  };

  return (
    <Paper sx={{ width: 250, height: "100vh", overflowY: "auto" }}>
      <List>
        {Array.from(groups.keys()).map((groupId) => (
          <ListItem
            key={groupId}
            onClick={() => handleSelect(groupId)}
            sx={{
              backgroundColor:
                selectedGroupId === groupId ? "#e0e0e0" : "transparent",
            }}
          >
            <ListItemText primary={groups.get(groupId)?.name} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button variant="contained" fullWidth onClick={handleCreateGroup}>
          Create a group
        </Button>
      </Box>
    </Paper>
  );
}
