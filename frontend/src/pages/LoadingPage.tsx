import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <CircularProgress size={50} />
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Loading...
      </Typography>
    </Box>
  );
}
