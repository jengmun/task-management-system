import { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../../context/login-context";
import handleGetRequest from "../../hooks/handleGetRequest";

const Overview = () => {
  const loginContext = useContext(LoginContext);

  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    if (loginContext.isLoggedIn.account_type === "Admin") {
      const data = await handleGetRequest("task/all-apps");
      if (data) {
        setAllApps(data);
      }
    } else {
      const data = await handleGetRequest("task/all-apps/user");
      if (data) {
        setAllApps(data);
      }
    }
  };

  useEffect(() => {
    fetchAllApps();
  }, []);

  return (
    <div>
      <NavLink to="/app/create-app">
        <button>Create App</button>
      </NavLink>
      {allApps.map((app) => {
        return (
          <NavLink to={`/app/${app.acronym}`}>
            <h1>{app.acronym}</h1>
          </NavLink>
        );
      })}
    </div>
  );
};

export default Overview;
