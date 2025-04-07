import { useState } from "react";
import { List, ListItem, ListItemText, Paper, Box } from "@mui/material";
import type { Groups } from "../types";
import CreateGroupDialog from "./CreateGroupDialog";

type GroupSidebarProps = {
  groups: Groups;
  onSelect: (group: number) => void; // Callback when a group is selected
  onCreateGroup: (groupName: string) => void; // Callback when a group is created
};

export default function GroupSidebar({
  groups,
  onSelect,
  onCreateGroup,
}: GroupSidebarProps) {
  const [selectedGroupId, setSelectedGroup] = useState<number | null>(null);

  const handleSelect = (group: number) => {
    setSelectedGroup(group);
    onSelect(group);
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
        <CreateGroupDialog onCreateGroup={onCreateGroup} />
      </Box>
    </Paper>
  );
}
