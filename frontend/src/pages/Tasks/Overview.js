import { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../../context/login-context";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

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

  // ------------- Check if PM -------------/
  const [isPM, setIsPM] = useState(false);

  const checkPM = async () => {
    const data = await handlePostRequest("task/is-group", {
      group: "Project Manager",
    });
    if (data) {
      setIsPM(data);
    }
  };

  useEffect(() => {
    fetchAllApps();
    checkPM();
  }, []);

  return (
    <div>
      {loginContext.isLoggedIn.account_type === "Admin" && (
        <NavLink to="/app/assign-PM">
          <button className="btn">Assign PM</button>
        </NavLink>
      )}

      {isPM && (
        <NavLink to="/app/create-app">
          <button>Create App</button>
        </NavLink>
      )}

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
