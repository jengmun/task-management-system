import { useState, useEffect, useContext } from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import handleGetRequest from "../hooks/handleGetRequest";
import LoginContext from "../context/login-context";

const PermissionsRoute = (props) => {
  const [isAuthorised, setIsAuthorised] = useState(null);
  const location = useLocation();
  const app = location.pathname.slice(5, 8);
  const loginContext = useContext(LoginContext);

  // ------------- Check if Member of the App -------------/
  const checkMember = async () => {
    const data = await handleGetRequest("task/all-apps/user");
    if (data && data.some(({ acronym }) => acronym === app)) {
      setIsAuthorised(true);
    } else {
      if (loginContext.isLoggedIn.account_type === "Admin") {
        setIsAuthorised(true);
      } else {
        setIsAuthorised(false);
      }
    }
  };

  useEffect(() => {
    checkMember();
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
