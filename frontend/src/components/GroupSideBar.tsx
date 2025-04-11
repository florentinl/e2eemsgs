import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import type { Groups } from "../types";
import CreateGroupDialog from "./CreateGroupDialog";
import ProfileMenu from "./ProfileMenu";

type GroupSidebarProps = {
  groups: Groups;
  selectedGroupId?: number;
  onSelect: (group: number) => void; // Callback when a group is selected
  onCreateGroup: (groupName: string) => void; // Callback when a group is created
};

export default function GroupSidebar({
  groups,
  selectedGroupId,
  onSelect,
  onCreateGroup,
}: GroupSidebarProps) {
  const handleSelect = (group: number) => {
    onSelect(group);
  };

  return (
    <Paper sx={{ width: 240, height: "100svh", overflowY: "auto" }}>
      <ProfileMenu />
      <Divider />
      <List>
        {Array.from(groups.keys()).map((groupId) => (
          <ListItem
            key={groupId}
            onClick={() => handleSelect(groupId)}
            sx={{
              borderRadius: "1em",
              borderStyle: "solid",
              borderColor:
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
