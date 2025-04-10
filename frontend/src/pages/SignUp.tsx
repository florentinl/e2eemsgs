import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import {
  useState,
  type ChangeEventHandler,
  type MouseEventHandler,
} from "react";
import { derive_key_pair } from "argon2wasm";
import InfoBox from "../components/InfoBox";
import { signupApiAuthSignupPost } from "../api-client";
import { useNavigate } from "@tanstack/react-router";
import { sendLogin } from "../lib/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [disableButton, setDisableButton] = useState(false);

  // states used to know what textfields must be set as error, and what error to display
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

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

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    let usernameOk = credentials.username.length >= 8;
    let passwordOk = credentials.password.length > 0;
    let confirmPasswordOk = credentials.confirmPassword == credentials.password;

    setUsernameError(!usernameOk);
    setPasswordError(!passwordOk);
    setConfirmPasswordError(!confirmPasswordOk);

    if (!confirmPasswordOk) {
      showError("Password and Confirm password must match");
    }
    if (!passwordOk) {
      showError("Password must not be empty");
    }
    if (!usernameOk) {
      showError("Username must be 8 characters or longer");
    }

    if (usernameOk && passwordOk && confirmPasswordOk) {
      sendSignUp(credentials.username, credentials.password);
    }
  };

  const onLoginSuccess = (msg: string) => {
    setDisableButton(true);
    setTimeout(() => navigate({ to: "/" }), 1000);
    showSuccess(msg);
  };

  const sendSignUp = async (username: string, password: string) => {
    const asymKeys = derive_key_pair(password, username);

    const response = await signupApiAuthSignupPost({
      body: {
        username: username,
        public_key: asymKeys.public_key,
      },
    });

    if (response.error) {
      if (response.response.status == 409) {
        showError("Username already in use");
      } else {
        showError("Internal server error");
      }
      return;
    }

    localStorage.setItem("publicKey", asymKeys.public_key);
    localStorage.setItem("privateKey", asymKeys.private_key);

    await sendLogin(username, password, showError, onLoginSuccess);
  };

  return (
    <Box
      sx={{
        height: "100svh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ m: 4, p: 2, maxWidth: "50%" }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Sign Up
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
          <TextField
            fullWidth
            label="Confirm password"
            name="confirmPassword"
            type="password"
            variant="outlined"
            margin="normal"
            value={credentials.confirmPassword}
            onChange={handleChange}
            error={confirmPasswordError}
          />
          <InfoBox
            show={showInfo}
            content={infoContent}
            isError={isInfoError}
          />
          <Button
            fullWidth
            disabled={disableButton}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignUp;
