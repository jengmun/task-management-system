import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div className="prose">
      <h1>Welcome</h1>
      <h3>To start</h3>
      <NavLink to="/login" style={{ textDecoration: "none" }}>
        <button className="btn btn-primary">Login</button>
      </NavLink>
    </div>
  );
};

export default Home;
