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
import { asym_decrypt, derive_key_pair } from "argon2wasm";
import {
  answerApiAuthLoginAnswerPost,
  challengeApiAuthLoginChallengePost,
  whoamiApiSessionWhoamiGet,
} from "../api-client";
import { useNavigate } from "@tanstack/react-router";

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

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
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
      sendLogin(credentials.username, credentials.password);
    }
  };

  const sendLogin = async (username: string, password: string) => {
    const asymKeys = derive_key_pair(password, username);

    let challengeId: number;
    let challengeCipher: string;

    // Request a challenge
    {
      let response = await challengeApiAuthLoginChallengePost({
        body: {
          username: username,
        },
      });

      if (response.error) {
        showError("Internal server error");
        return;
      }

      challengeId = response.data.id!;
      challengeCipher = response.data.challenge;
    }

    // Resolve the challenge
    let challengeAnswer: string;

    try {
      challengeAnswer = asym_decrypt(challengeCipher, asymKeys.private_key);
    } catch {
      showError("Wrong username or password");
      return;
    }

    // Answer a challenge
    {
      let response = await answerApiAuthLoginAnswerPost({
        body: {
          id: challengeId,
          username: username,
          challenge: challengeAnswer,
        },
      });

      if (response.error) {
        if (response.response.status == 403) {
          showError("Wrong username or password");
        } else {
          showError("Internal server error");
        }
        return;
      }

      setDisableButton(true);
      localStorage.setItem("publicKey", asymKeys.public_key);
      localStorage.setItem("privateKey", asymKeys.private_key);

      showSuccess(
        "Successfully logged in with username " + response.data.username
      );
      setTimeout(() => navigate({ to: "/" }), 500);
    }
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
