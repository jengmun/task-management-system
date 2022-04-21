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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState("");

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <BrowserRouter>
        <Nav />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login">
            {isLoggedIn.username ? <Redirect to="/" /> : <Login />}
          </Route>
          <Route path="/profile">
            {isLoggedIn.username ? <Profile /> : <Redirect to="/" />}
          </Route>
          <Route path="/admin/user-management">
            {isLoggedIn.account_type === "Admin" ? (
              <UserManagement />
            ) : (
              <Redirect to="/" />
            )}
          </Route>
          <Route path="/admin/create-user">
            <CreateUser />
            {/* {isLoggedIn.account_type === "Admin"  ? <CreateUser /> : <Redirect to="/" />} */}
          </Route>
          <Route path="/reset-password" component={ResetPassword} />
        </Switch>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
