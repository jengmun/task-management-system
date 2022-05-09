import { useEffect, useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Cookies from "js-cookie";
import "./App.css";
import LoginContext from "./context/login-context";
import Home from "./pages/User/Home";
import Nav from "./components/Nav";
import Login from "./pages/User/Login";
import UserManagement from "./pages/User/UserManagement";
import CreateUser from "./pages/User/CreateUser";
import Profile from "./pages/User/Profile";
import ResetPassword from "./pages/User/ResetPassword";
import ForgotPassword from "./pages/User/ForgotPassword";
import GroupManagement from "./pages/User/GroupManagement";
import handleGetRequest from "./hooks/handleGetRequest";
import AdminRoute from "./components/AdminRoute";
import Overview from "./pages/Tasks/Overview";
import CreateApp from "./pages/Tasks/CreatePlan";
import CreatePlan from "./pages/Tasks/CreatePlan";
import CreateTask from "./pages/Tasks/CreateTask";
import KanbanBoard from "./pages/Tasks/KanbanBoard";

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
            {/* TASK MANAGEMENT ROUTES */}
            <Route path="/app/all" component={Overview} />

            <Route path="/app/create-app" component={CreateApp} />
            <Route path="/app/:app/create-plan" component={CreatePlan} />
            <Route path="/app/:app/create-task" component={CreateTask} />
            <Route path="/app/:app" component={KanbanBoard} />

            {/* USER ROUTES */}
            <Route exact path="/">
              {isLoggedIn.username ? <Overview /> : <Home />}
            </Route>
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
