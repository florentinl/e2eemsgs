import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import {
  useEffect,
  useState,
  type ChangeEventHandler,
  type MouseEventHandler,
} from "react";
import InfoBox from "../components/InfoBox";
import { whoamiApiSessionWhoamiGet } from "../api-client";
import { useNavigate } from "@tanstack/react-router";
import { sendLogin } from "../lib/auth";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [disableButton, setDisableButton] = useState(false);

  // states used to know what textfields must be set as error, and what error to display
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // states controling whether the info box is shown, and what to show
  const [showInfo, setShowInfo] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [isInfoError, setIsInfoError] = useState(false);

  useEffect(() => {
    whoamiApiSessionWhoamiGet().then(({ data }) => {
      if (data) {
        navigate({ to: "/" });
      }
    });
  }, []);

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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const onLoginSuccess = (msg: string) => {
    showSuccess(msg);
    setDisableButton(true);
    setTimeout(() => navigate({ to: "/" }), 500);
  };

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    let usernameOk = credentials.username.length >= 8;
    let passwordOk = credentials.password.length > 0;

    setUsernameError(!usernameOk);
    setPasswordError(!passwordOk);

    if (!passwordOk) {
      showError("Password must not be empty");
    }
    if (!usernameOk) {
      showError("Username must be 8 characters or longer");
    }

    if (usernameOk && passwordOk) {
      console.log("Loging in with credentials: ", credentials);
      await sendLogin(
        credentials.username,
        credentials.password,
        showError,
        onLoginSuccess
      );
    }
  };

  return (
    <Box
      sx={{
        height: "100svh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ m: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Login
          </Typography>
          <TextField
            fullWidth
            label="Username"
            name="username"
            variant="outlined"
            margin="normal"
            value={credentials.username}
            onChange={handleChange}
            error={usernameError}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            value={credentials.password}
            onChange={handleChange}
            error={passwordError}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Link
              sx={{
                ":hover": {
                  cursor: "pointer",
                },
              }}
              onClick={() => navigate({ to: "/signup" })}
            >
              sign up here
            </Link>
          </Box>
          <InfoBox
            show={showInfo}
            content={infoContent}
            isError={isInfoError}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={disableButton}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
