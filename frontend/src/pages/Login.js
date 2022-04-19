import { useContext, useState } from "react";
import LoginContext from "../context/login-context";

const Login = () => {
  const loginContext = useContext(LoginContext);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        body: JSON.stringify({ username: username, password: password }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data) {
        loginContext.setIsLoggedIn(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <label>Username</label>
      <input
        id="username"
        name="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <label>Password</label>
      <input
        id="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input type="submit" onClick={handleLogin} />
    </div>
  );
};

export default Login;
