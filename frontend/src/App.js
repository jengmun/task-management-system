import { useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState("");

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <BrowserRouter>
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
          <Route path="/admin/user-management">
            {isLoggedIn.account_type === "Admin" ? (
              <UserManagement />
            ) : (
              <Redirect to="/" />
            )}
          </Route>
          <Route path="/admin/create-user">
            {isLoggedIn.account_type === "Admin" ? (
              <CreateUser />
            ) : (
              <Redirect to="/" />
            )}
          </Route>
          <Route path="/admin/group-management">
            {isLoggedIn.account_type === "Admin" ? (
              <GroupManagement />
            ) : (
              <Redirect to="/" />
            )}
          </Route>
        </Switch>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
