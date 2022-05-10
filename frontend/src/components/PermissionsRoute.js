import { useState, useEffect } from "react";
import { Route, Redirect, useParams, useLocation } from "react-router-dom";
import handleGetRequest from "../hooks/handleGetRequest";
import handlePostRequest from "../hooks/handlePostRequest";

const PermissionsRoute = (props) => {
  const [isAuthorised, setIsAuthorised] = useState(null);
  const location = useLocation();
  const app = location.pathname.slice(5, 8);

  // ------------- Check if PM (Any App) -------------/
  const checkPM = async () => {
    const data = await handlePostRequest("task/is-group", {
      group: "Project Manager",
    });
    if (data) {
      setIsAuthorised(data);
    }
  };

  // ------------- Check if Lead of the App -------------/
  const checkLead = async () => {
    const data = await handlePostRequest("task/is-group", {
      group: "Team Lead",
      acronym: app,
    });
    if (data) {
      setIsAuthorised(data);
    }
  };

  // ------------- Check if Member of the App -------------/
  const checkMember = async () => {
    const data = await handleGetRequest("task/all-apps/user");
    if (data.some(({ acronym }) => acronym === app)) {
      setIsAuthorised(true);
    } else {
      setIsAuthorised(false);
    }
  };

  useEffect(() => {
    if (props.permission === "PM") {
      checkPM();
    } else if (props.permission === "Lead") {
      checkLead();
    } else if (props.permission === "All") {
      checkMember();
    }
  }, []);

  return (
    <>
      {isAuthorised !== null && (
        <Route exact path={props.path}>
          {isAuthorised ? <props.component /> : <Redirect to="/" />}
        </Route>
      )}
    </>
  );
};

export default PermissionsRoute;
