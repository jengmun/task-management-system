import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";

const Overview = () => {
  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    const data = await handleGetRequest("task/all-apps");
    if (data) {
      setAllApps(data);
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
