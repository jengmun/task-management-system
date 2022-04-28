import { useEffect, useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Cookies from "js-cookie";
import "./App.css";
import LoginContext from "./context/login-context";
import Home from "./pages/Home";
import Nav from "./components/Nav";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import CreateUser from "./pages/CreateUser";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import GroupManagement from "./pages/GroupManagement";
import handleGetRequest from "./hooks/handleGetRequest";
import AdminRoute from "./components/AdminRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState("");

  const fetchDetails = async () => {
    const data = await handleGetRequest("user/login-details");

    if (data) {
      setIsLoggedIn(data);
    }
  };

  useEffect(() => {
    if (Cookies.get("Username")) {
      fetchDetails();
    }
  }, []);

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <BrowserRouter>
        <div className="flex flex-row min-h-screen">
          <Nav />
          <Switch>
            {/* USER ROUTES */}
            <Route exact path="/" component={Home} />
            <Route path="/login">
              {isLoggedIn.username ? <Redirect to="/" /> : <Login />}
            </Route>
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password/:username" component={ResetPassword} />
            <Route path="/profile">
              {isLoggedIn.username ? <Profile /> : <Redirect to="/" />}
            </Route>

            {/* ADMIN ROUTES */}
            {isLoggedIn.account_type && (
              <>
                <AdminRoute
                  path="/admin/user-management"
                  component={UserManagement}
                />
                <AdminRoute path="/admin/create-user" component={CreateUser} />
                <AdminRoute
                  path="/admin/group-management"
                  component={GroupManagement}
                />
              </>
            )}
          </Switch>
        </div>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
