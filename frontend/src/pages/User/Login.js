import { useContext, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import LoginContext from "../../context/login-context";
import handlePostRequest from "../../hooks/handlePostRequest";

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

  return (
    <div>
      <h3>Login</h3>
      <label htmlFor="username">
        <span>Username</span>
      </label>
      <input
        id="username"
        name="username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <label htmlFor="password">
        <span>Password</span>
      </label>
      <input
        type="password"
        id="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Submit</button>
      {message}
      <NavLink to="/forgot-password" style={{ textDecoration: "none" }}>
        <button>Forgot password</button>
      </NavLink>
    </div>
  );
};

export default Login;
