import { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../../context/login-context";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import { useTheme } from "@mui/material/styles";
import { Box, Button, Typography, Modal } from "@mui/material";
import CreateApp from "./CreateApp";

const Overview = () => {
  const loginContext = useContext(LoginContext);

  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    if (loginContext.isLoggedIn.account_type === "Admin") {
      const data = await handleGetRequest("task/all-apps");
      if (data) {
        setAllApps(data);
      }
    } else {
      const data = await handleGetRequest("task/all-apps/user");
      if (data) {
        setAllApps(data);
      }
    }
  };

  // ------------- Check if PM -------------/
  const [isPM, setIsPM] = useState(false);

  const checkPM = async () => {
    const data = await handlePostRequest("task/is-group", {
      group: "Project Manager",
    });
    if (data) {
      setIsPM(data);
    }
  };

  useEffect(() => {
    fetchAllApps();
    checkPM();
  }, []);

  const theme = useTheme();

  const [openCreateApp, setOpenCreateApp] = useState(false);

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography variant="h1">Applications</Typography>
        {loginContext.isLoggedIn.account_type === "Admin" && (
          <NavLink to="/app/assign-PM" style={{ textDecoration: "none " }}>
            <Button variant="contained" sx={{ ml: 2 }} color="warning">
              Assign PM
            </Button>
          </NavLink>
        )}

        {isPM && (
          <>
            <Modal
              open={openCreateApp}
              onClose={() => {
                setOpenCreateApp(false);
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CreateApp fetchAllApps={fetchAllApps} />
            </Modal>
            <Button
              onClick={() => {
                setOpenCreateApp(true);
              }}
              sx={{ ml: 2 }}
              variant="contained"
              color="warning"
            >
              Create App
            </Button>
          </>
        )}
      </Box>
      <Box sx={{ display: "flex" }}>
        {allApps.map((app) => {
          return (
            <NavLink
              key={app.acronym}
              to={`/app/${app.acronym}`}
              style={{ textDecoration: "none" }}
            >
              <Box
                sx={{
                  width: "200px",
                  height: "150px",
                  p: 2,
                  mr: 2,
                  mt: 2,
                  borderRadius: "10px",
                  backgroundColor: theme.palette.primary.main,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  {app.acronym}
                </Typography>
              </Box>
            </NavLink>
          );
        })}
      </Box>
    </Box>
  );
};

export default Overview;
