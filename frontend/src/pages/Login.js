import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../context/login-context";
import handlePostRequest from "../hooks/handlePostRequest";

const Login = () => {
  const loginContext = useContext(LoginContext);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  const handleLogin = async () => {
    const data = await handlePostRequest("user/login", { username, password });

    if (data) {
      loginContext.setIsLoggedIn(data);
    }
  };

  return (
    <div>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input type="submit" onClick={handleLogin} />
      <NavLink to="/forgot-password">
        <button className="btn btn-secondary">Forgot password</button>
      </NavLink>
    </div>
  );
};

export default Login;
