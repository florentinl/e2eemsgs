import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material"
import { useState, type ChangeEventHandler, type MouseEventHandler } from "react";

const Login = () => {
    const [credentials, setCredentials] = useState({ username: "", password: "" });

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        console.log("Logging in with:", credentials);
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
                    />
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
    )
}

export default Login;
