import { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../../context/login-context";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import { useTheme } from "@mui/material/styles";
import { Box, Button, Typography, Modal } from "@mui/material";
import CreateApp from "./CreateApp";
import AssignPM from "./AssignPM";

const Overview = () => {
  const loginContext = useContext(LoginContext);

  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    const data = await handleGetRequest("task/all-apps");
    if (data) {
      setAllApps(data);
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

  const [openAssignPM, setOpenAssignPM] = useState(false);
  const [openCreateApp, setOpenCreateApp] = useState(false);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h1" sx={{ textAlign: "center", mb: 2 }}>
        Applications
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {loginContext.isLoggedIn.account_type === "Admin" && (
          <>
            <Modal
              open={openAssignPM}
              onClose={() => {
                setOpenAssignPM(false);
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AssignPM />
            </Modal>
            <Button
              variant="contained"
              sx={{ ml: 2 }}
              color="info"
              onClick={() => {
                setOpenAssignPM(true);
              }}
            >
              Assign PM
            </Button>
          </>
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
              color="error"
            >
              Create App
            </Button>
          </>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
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
                  borderRadius: "20px",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.33)",
                  backgroundColor: theme.palette.background.paper,
                  display: "flex",
                  justifyContent: "center",
                  color: theme.palette.primary.dark,
                  transition: "background-color 0.5s, transform 0.5s",
                  ":active": { color: theme.palette.primary.main },
                  ":hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    transform: "scale(1.1)",
                  },
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
