import { useEffect, useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Cookies from "js-cookie";
import "./App.css";
import AdminRoute from "./ProtectedRoutes/AdminRoute";
import PermissionsRoute from "./ProtectedRoutes/PermissionsRoute";
import LoginContext from "./context/login-context";
import handleGetRequest from "./hooks/handleGetRequest";
import Nav from "./components/Nav";
import Login from "./pages/User/Login";
import UserManagement from "./pages/User/UserManagement";
import CreateUser from "./pages/User/CreateUser";
import Profile from "./pages/User/Profile";
import ResetPassword from "./pages/User/ResetPassword";
import ForgotPassword from "./pages/User/ForgotPassword";
import GroupManagement from "./pages/User/GroupManagement";
import Overview from "./pages/Tasks/Overview";
import AssignPM from "./pages/Tasks/AssignPM";
import KanbanBoard from "./pages/Tasks/KanbanBoard";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Box } from "@mui/material";

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

  // ------------- CSS -------------

  const theme = createTheme({
    palette: {
      primary: { main: "rgb(23 239 239)", light: "rgba(242, 241, 238, 0.6)" },
      info: { main: "rgb(46 170 220)" },
      error: { light: "rgb(255 226 221)", main: "rgb(158 33 30)" },
      warning: { main: "rgb(253 236 200)" },
      success: { main: "rgb(219 237 219)" },
    },
    typography: {
      fontFamily: "Helvetica",
      h1: { fontSize: "3rem", fontWeight: 700 },
      h2: { fontSize: "2.5rem", fontWeight: 600 },
      h3: { fontSize: "2rem" },
      h4: { fontSize: "1.75rem" },
      h5: { fontSize: "1.5rem" },
      h6: { fontSize: "1.25rem" },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.875rem" },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <BrowserRouter>
          <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
            <Nav />
            <Box sx={{ width: "85%", ml: "15%" }}>
              <Switch>
                <Route exact path="/">
                  {isLoggedIn.username ? (
                    <Overview />
                  ) : (
                    <Redirect to="/login" />
                  )}
                </Route>

                {/* USER ROUTES */}
                <Route path="/login">
                  {isLoggedIn.username ? <Redirect to="/" /> : <Login />}
                </Route>
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route
                  path="/reset-password/:username"
                  component={ResetPassword}
                />

                {/* Required for refreshes */}
                {isLoggedIn.account_type && (
                  <Switch>
                    <Route path="/profile">
                      {isLoggedIn.username ? <Profile /> : <Redirect to="/" />}
                    </Route>
                    {/* TASK MANAGEMENT ROUTES */}
                    <AdminRoute path="/app/assign-PM" component={AssignPM} />

                    <PermissionsRoute
                      path="/app/:app"
                      component={KanbanBoard}
                    />

                    {/* ADMIN ROUTES */}
                    <AdminRoute
                      path="/admin/user-management"
                      component={UserManagement}
                    />
                    <AdminRoute
                      path="/admin/create-user"
                      component={CreateUser}
                    />
                    <AdminRoute
                      path="/admin/group-management"
                      component={GroupManagement}
                    />
                  </Switch>
                )}
              </Switch>
            </Box>
          </Box>
        </BrowserRouter>
      </LoginContext.Provider>
    </ThemeProvider>
  );
}

export default App;
