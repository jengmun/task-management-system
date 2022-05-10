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
import AssignPM from "./pages/Tasks/AssignPM";
import CreateApp from "./pages/Tasks/CreateApp";
import CreatePlan from "./pages/Tasks/CreatePlan";
import CreateTask from "./pages/Tasks/CreateTask";
import KanbanBoard from "./pages/Tasks/KanbanBoard";
import EditTask from "./pages/Tasks/EditTask";
import EditPlan from "./pages/Tasks/EditPlan";
import EditApp from "./pages/Tasks/EditApp";
import PermissionsRoute from "./components/PermissionsRoute";

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
            <Route exact path="/">
              {isLoggedIn.username ? <Overview /> : <Home />}
            </Route>

            {/* USER ROUTES */}
            <Route path="/login">
              {isLoggedIn.username ? <Redirect to="/" /> : <Login />}
            </Route>
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password/:username" component={ResetPassword} />
            <Route path="/profile">
              {isLoggedIn.username ? <Profile /> : <Redirect to="/" />}
            </Route>

            {/* Required for refreshes */}
            {isLoggedIn.account_type && (
              <Switch>
                {/* TASK MANAGEMENT ROUTES */}
                <AdminRoute path="/app/assign-PM" component={AssignPM} />

                <PermissionsRoute
                  path="/app/create-app"
                  component={CreateApp}
                  permission="PM"
                />
                <PermissionsRoute
                  path="/app/:app/edit-app"
                  component={EditApp}
                  permission="PM"
                />
                <PermissionsRoute
                  path="/app/:app/create-plan"
                  component={CreatePlan}
                  permission="PM"
                />
                <PermissionsRoute
                  path="/app/:app/edit-plan"
                  component={EditPlan}
                  permission="PM"
                />
                <PermissionsRoute
                  path="/app/:app/create-task"
                  component={CreateTask}
                  permission="Lead"
                />
                <PermissionsRoute
                  path="/app/:app/:task/edit-task"
                  component={EditTask}
                  permission="Lead"
                />

                <PermissionsRoute
                  path="/app/:app"
                  component={KanbanBoard}
                  permission="All"
                />
                {/* <Route path="/app/:app" component={KanbanBoard} /> */}

                {/* ADMIN ROUTES */}
                <AdminRoute
                  path="/admin/user-management"
                  component={UserManagement}
                />
                <AdminRoute path="/admin/create-user" component={CreateUser} />
                <AdminRoute
                  path="/admin/group-management"
                  component={GroupManagement}
                />
              </Switch>
            )}
          </Switch>
        </div>
      </BrowserRouter>
    </LoginContext.Provider>
  );
}

export default App;
