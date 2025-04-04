import { Box, Button, Card, CardContent } from "@mui/material";
import { useState } from "react";
import InfoBox from "../components/InfoBox";
import { getUidApiSessionGetUidPost } from "../api-client";

const CookieCheck = () => {
  // states controling whether the info box is shown, and what to show
  const [showInfo, setShowInfo] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [isInfoError, setIsInfoError] = useState(false);

  const showError = (message: string) => {
    setIsInfoError(true);
    setShowInfo(true);
    setInfoContent(message);
  };

  const showSuccess = (message: string) => {
    setIsInfoError(false);
    setShowInfo(true);
    setInfoContent(message);
  };

  const sendRequest = async () => {
    let response = await getUidApiSessionGetUidPost();
    if (response.error) {
      if (response.response.status == 401) {
        showError("Invalid cookie");
      } else if (response.response.status == 424) {
        showError("No cookie found");
      } else {
        showError("Internal server error");
      }
      return;
    }
    showSuccess("Cookie is valid");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ m: 4, p: 2 }}>
        <CardContent>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 1 }}
            onClick={sendRequest}
          >
            Check Cookie
          </Button>
          <InfoBox
            show={showInfo}
            content={infoContent}
            isError={isInfoError}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CookieCheck;
