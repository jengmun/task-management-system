import { useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import "./App.css";
import LoginContext from "./context/login-context";
import Nav from "./components/Nav";
import Login from "./pages/Login";
import Balance from "./pages/Balance";
import Account from "./pages/Account";
import Contact from "./pages/Contact";
import UserManagement from "./pages/UserManagement";
import AccountSettings from "./pages/AccountSettings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState("");

  return (
    <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <BrowserRouter>
        <Nav />
        <Switch>
          <Route path="/login">
            {isLoggedIn.username ? <Redirect to="/" /> : <Login />}
          </Route>
          <Route path="/balance">
            {isLoggedIn.username ? <Balance /> : <Redirect to="/" />}
          </Route>
          <Route path="/account">
            {isLoggedIn.username ? <Account /> : <Redirect to="/" />}
          </Route>
          <Route path="/account-settings">
            {isLoggedIn.username ? <AccountSettings /> : <Redirect to="/" />}
          </Route>
          <Route path="/contact" component={Contact} />
          <Route path="/user">
            {isLoggedIn.admin ? <UserManagement /> : <Redirect to="/" />}
          </Route>
        </Switch>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
