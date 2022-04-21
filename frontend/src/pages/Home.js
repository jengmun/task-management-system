import { useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../context/login-context";

const Home = () => {
  const loginContext = useContext(LoginContext);

  return (
    <div>
      {loginContext.isLoggedIn ? (
        "Welcome to your dashboard"
      ) : (
        <>
          <h1>Welcome</h1>
          <h3>To start</h3>
          <NavLink to="/login">
            <button>Login</button>
          </NavLink>
        </>
      )}
    </div>
  );
};

export default Home;
