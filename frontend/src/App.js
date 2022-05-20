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
      primary: {
        dark: "rgb(100 100 100)",
        main: "rgb(167 167 167)",
        light: "rgb(192 192 192)",
      },
      secondary: { main: "rgb(255, 255, 255)" },
      info: { main: "rgb(171 216 229)" },
      error: { main: "rgb(232 176 185)" },
      warning: { main: "rgb(233 223 149)" },
      success: { main: "rgb(189 217 144)" },
      background: {
        default: "rgba(255, 255, 255, 0.5)",
        paper: "rgba(255, 255, 255, 0.3)",
      },
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
          <Box
            sx={{
              display: "flex",
              height: "100vh",
              width: "100%",
            }}
          >
            <Nav />
            <Box
              sx={{
                width: "95%",
                ml: "5%",
                display: "flex",
                justifyContent: "center",
              }}
            >
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
