import { useContext, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import LoginContext from "../../context/login-context";
import handlePostRequest from "../../hooks/handlePostRequest";
import { useTheme } from "@mui/material/styles";
import { Box, TextField, Button, Typography } from "@mui/material";

const Login = () => {
  const loginContext = useContext(LoginContext);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  const [message, setMessage] = useState("");
  const history = useHistory();

  const handleLogin = async () => {
    const data = await handlePostRequest("user/login", { username, password });

    if (data.username) {
      loginContext.setIsLoggedIn(data);
      history.push("/");
    } else {
      setMessage(data);
    }
  };

  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography variant="h3" sx={{ mb: 2 }}>
        Login
      </Typography>
      <TextField
        required
        id="outlined-search"
        label="Username"
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mt: 1, mb: 1 }}
      />
      <TextField
        required
        id="outlined-search"
        label="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mt: 1, mb: 1 }}
      />
      <Typography variant="body1" color="error">
        {message}
      </Typography>
      <Button
        onClick={handleLogin}
        variant="contained"
        color="warning"
        sx={{ mt: 1, mb: 1 }}
      >
        Submit
      </Button>
      <NavLink to="/forgot-password" style={{ textDecoration: "none" }}>
        <Button variant="outlined" color="info" sx={{ mt: 1, mb: 1 }}>
          Forgot password
        </Button>
      </NavLink>
    </Box>
  );
};

export default Login;
