import { useContext, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import LoginContext from "../context/login-context";
import handlePostRequest from "../hooks/handlePostRequest";

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
    <div className="prose flex flex-col items-center justify-center">
      <h3>Login</h3>
      <label htmlFor="username" className="label">
        <span className="label-text">Username</span>
      </label>
      <input
        id="username"
        name="username"
        className="input input-bordered input-primary max-w-xs"
        // placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <label htmlFor="password" className="label">
        <span className="label-text">Password</span>
      </label>
      <input
        type="password"
        id="password"
        name="password"
        className="input input-bordered input-primary max-w-xs"
        // placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn mt-2" onClick={handleLogin}>
        Submit
      </button>
      {message}
      <NavLink to="/forgot-password" style={{ textDecoration: "none" }}>
        <button className="btn btn-secondary mt-2">Forgot password</button>
      </NavLink>
    </div>
  );
};

export default Login;
