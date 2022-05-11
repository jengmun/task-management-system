import { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import LoginContext from "../context/login-context";

const AdminRoute = (props) => {
  const loginContext = useContext(LoginContext);

  return (
    <Route path={props.path}>
      {loginContext.isLoggedIn.account_type === "Admin" ? (
        <props.component />
      ) : (
        <Redirect to="/" />
      )}
    </Route>
  );
};

export default AdminRoute;
