import { useContext, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import LoginContext from "../../context/login-context";
import handlePostRequest from "../../hooks/handlePostRequest";
import { TextField, Button, Typography } from "@mui/material";

const Login = () => {
  const loginContext = useContext(LoginContext);

  const [message, setMessage] = useState("");
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await handlePostRequest("user/login", {
      username: e.target.username.value,
      password: e.target.password.value,
    });

    if (data.username) {
      loginContext.setIsLoggedIn(data);
      history.push("/");
    } else {
      setMessage(data);
    }
  };

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
      onSubmit={handleLogin}
    >
      <Typography variant="h3" sx={{ mb: 2 }}>
        Login
      </Typography>
      <TextField
        required
        id="username"
        label="Username"
        sx={{ mt: 1, mb: 1 }}
      />
      <TextField
        required
        id="password"
        label="Password"
        type="password"
        sx={{ mt: 1, mb: 1 }}
      />
      <Typography variant="body1" color="error">
        {message}
      </Typography>
      <Button
        type="submit"
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
    </form>
  );
};

export default Login;
