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
import InfoBox from "../components/InfoBox";
import { useCryptoWasmReady } from "../hooks/cryptoWasm";
import { asym_decrypt, derive_key_pair } from "argon2wasm";

const Login = () => {
  const { initialized } = useCryptoWasmReady()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  // states used to know what textfields must be set as error, and what error to display
  const [usernameError,setUsernameError] = useState(false)
  const [passwordError,setPasswordError] = useState(false)

  // states controling whether the info box is shown, and what to show
  const [showInfo,setShowInfo] = useState(false)
  const [infoContent,setInfoContent] = useState("")
  const [isInfoError, setIsInfoError] = useState(false)

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
      setShowInfo(true)
      setIsInfoError(true)
      setInfoContent("Password must not be empty")
    }
    if (!usernameOk) {
      setShowInfo(true)
      setIsInfoError(true)
      setInfoContent("Username must be 8 characters or longer")
    }

    if (usernameOk && passwordOk) {
      console.log("Loging in with credentials: ", credentials)
      sendLogin(credentials.username,credentials.password)
    }
  };

  const  sendLogin =  (username: string, password: string) => {
      console.log("crypto context initialized: ",initialized)
      if (initialized) {
        derive_key_pair(password, username)
        const challengeRequestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username })
        };

        // Request a challenge
        fetch('/api/auth/login_challenge', challengeRequestOptions)
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            setInfoContent("Internal server error")
            throw new Error("error")
          }).then(data => {
            let answer = ""
            // In case of bad password, decryption fails and throws an error that we catch here
            try {
              answer = asym_decrypt(data.challenge)
            } catch (e) {
              setInfoContent("Wrong username or password")
              throw new Error("error")
            }
            console.log("here")
            const answerRequestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({id: data.id, username: data.username, challenge: answer  })
            };
            // Send answer to the challenge
            fetch('/api/auth/login_answer', answerRequestOptions)
              .then(response => {
                if (response.ok) {
                  return response.json();
                }else if (response.status == 403) {
                  setInfoContent("Wrong username or password")
                } else {
                  setInfoContent("Internal server error")
                }
                throw new Error("error")
              }).then(data => {
                setShowInfo(true)
                setIsInfoError(false)
                setInfoContent("Successfully logged in with username " + data.username)})
              .catch((e: Error) => {
                console.log(e)
                setShowInfo(true)
                setIsInfoError(true)
              }
              )
          })
          .catch((e: Error) => {
            console.log(e)
            setShowInfo(true)
            setIsInfoError(true)
          }
          )
      }
    }

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
          <InfoBox show={showInfo} content={infoContent} isError={isInfoError}/>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
