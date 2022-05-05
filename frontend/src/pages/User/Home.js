import { useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../../context/login-context";
import KanbanBoard from "../Tasks/KanbanBoard";

const Home = () => {
  const loginContext = useContext(LoginContext);

  return (
    <div className="prose">
      {loginContext.isLoggedIn ? (
        <KanbanBoard />
      ) : (
        <>
          <h1>Welcome</h1>
          <h3>To start</h3>
          <NavLink to="/login" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary">Login</button>
          </NavLink>
        </>
      )}
    </div>
  );
};

export default Home;
