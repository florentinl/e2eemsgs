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
import { useCryptoWasmReady } from "../hooks/cryptoWasm";
import { derive_key_pair } from "argon2wasm";
import InfoBox from "../components/InfoBox";

const SignUp = () => {
  const { initialized } = useCryptoWasmReady()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [usernameError,setUsernameError] = useState(false)
  const [passwordError,setPasswordError] = useState(false)
  const [confirmPasswordError,setConfirmPasswordError] = useState(false)

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
    let confirmPasswordOk = credentials.confirmPassword == credentials.password;

    setUsernameError(!usernameOk);
    setPasswordError(!passwordOk);
    setConfirmPasswordError(!confirmPasswordOk);

    if (!confirmPasswordOk) {
      setShowInfo(true)
      setIsInfoError(true)
      setInfoContent("Password and Confirm password must match")
    }
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

    if (usernameOk && passwordOk && confirmPasswordOk) {
      console.log("Loging in with credentials: ", credentials)
      sendSignUp(credentials.username,credentials.password)
    }
  };

  const  sendSignUp =  (username: string, password: string) => {
    console.log("crypto context initialized: ",initialized)
    if (initialized) {
      const publicKey = derive_key_pair(password, username)
    
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, public_key: publicKey })
        };
        fetch('/api/auth/signup', requestOptions)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else if (response.status == 409) {
              setInfoContent("Username already in use")
            } else {
              setInfoContent("Internal server error")
            }
            throw new Error("error")
          }).then(data => {
            setShowInfo(true)
            setIsInfoError(false)
            setInfoContent("Successfully signed up with username " + data.username)})
          .catch(() => {
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
          <InfoBox show={showInfo} content={infoContent} isError={isInfoError}/>
          <Button
            fullWidth
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
