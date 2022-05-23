import { useState, useEffect } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import moment from "moment";
import CustomSnackbar from "../../components/CustomSnackbar";

const CreateApp = (props) => {
  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  const [uncreatedApps, setUncreatedApps] = useState([]);

  const fetchUncreatedApps = async () => {
    const data = await handleGetRequest("task/uncreated-apps/user");
    if (data) {
      setUncreatedApps(data);
    }
  };

  useEffect(() => {
    fetchAllGroups();
    fetchUncreatedApps();
  }, []);

  const permissions = [
    "permitCreate",
    "permitOpen",
    "permitTodo",
    "permitDoing",
    "permitDone",
  ];

  const [newApp, setNewApp] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({
    permitCreate: "",
    permitOpen: "",
    permitTodo: "",
    permitDoing: "",
    permitDone: "",
  });

  // ------------- Snackbar -------------
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState("");

  const handleOpenSnackbar = (severity) => {
    setOpenSnackbar(true);
    setSeverity(severity);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();

    for (const permission of permissions) {
      if (!selectedPermissions[permission] || !newApp) {
        setMessage("Please fill in all details");
        handleOpenSnackbar("error");
        return;
      }
    }

    if (
      new Date(e.target.endDate.value) - new Date(e.target.startDate.value) <
      0
    ) {
      setMessage("End date must be later than start date!");
      handleOpenSnackbar("error");
      return;
    }

    const data = await handlePostRequest("task/create-app", {
      acronym: newApp,
      description: e.target.description.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      permitCreate: selectedPermissions.permitCreate,
      permitOpen: selectedPermissions.permitOpen,
      permitTodo: selectedPermissions.permitTodo,
      permitDoing: selectedPermissions.permitDoing,
      permitDone: selectedPermissions.permitDone,
    });

    setMessage(data);

    if (data === "Application successfully created") {
      handleOpenSnackbar("success");
      props.fetchAllApps();
    } else {
      handleOpenSnackbar("error");
    }
  };

  const [startDate, setStartDate] = useState("");

  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 5,
        maxWidth: "90vw",
        maxHeight: "80vh",
        overflowY: "scroll",
        backgroundColor: "white",
      }}
    >
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        Create App
      </Typography>
      <Box
        onSubmit={handleCreateApp}
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <FormControl sx={{ mt: 1, mb: 1 }}>
          <InputLabel id="acronym">Acronym</InputLabel>
          <Select
            id="acronym"
            label="acronym"
            sx={{ width: "200px" }}
            value={newApp}
            onChange={(e) => {
              setNewApp(e.target.value);
            }}
            MenuProps={{
              sx: { ".MuiList-root": { backgroundColor: "white" } },
            }}
          >
            {uncreatedApps.map((app) => {
              return (
                <MenuItem
                  value={app}
                  key={app}
                  sx={{
                    backgroundColor: "white",
                    ":hover": {
                      backgroundColor: theme.palette.info.main,
                    },
                  }}
                >
                  {app}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <TextareaAutosize
          required
          maxLength="255"
          minRows={3}
          id="description"
          placeholder="Description"
          sx={{ mt: 1, mb: 1 }}
        />
        <TextField
          id="startDate"
          label="Start Date"
          variant="outlined"
          type="date"
          required
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
          defaultValue={moment(new Date()).format("YYYY-MM-DD")}
          sx={{ mt: 2 }}
        />
        <TextField
          id="endDate"
          label="End Date"
          variant="outlined"
          required
          type="date"
          InputProps={{ inputProps: { min: startDate } }}
          defaultValue={moment(new Date()).format("YYYY-MM-DD")}
          sx={{ mt: 2, mb: 2 }}
        />
        <Typography>Permissions</Typography>
        {permissions.map((permission) => {
          return (
            <FormControl key={permission} sx={{ mt: 1, mb: 1 }}>
              <InputLabel id={permission}>{`${permission.slice(
                6
              )}`}</InputLabel>
              <Select
                id={permission}
                label={permission}
                sx={{ width: "200px" }}
                value={selectedPermissions[permission]}
                onChange={(e) => {
                  setSelectedPermissions({
                    ...selectedPermissions,
                    [permission]: e.target.value,
                  });
                }}
                MenuProps={{
                  sx: { ".MuiList-root": { backgroundColor: "white" } },
                }}
              >
                {allGroups.map((group) => {
                  return (
                    <MenuItem
                      value={group.group_name}
                      key={group.group_name}
                      sx={{
                        backgroundColor: "white",
                        ":hover": {
                          backgroundColor: theme.palette.info.main,
                        },
                      }}
                    >
                      {group.group_name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          );
        })}
        <Button type="submit" variant="contained" color="success">
          Submit
        </Button>
      </Box>
      <CustomSnackbar
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Card>
  );
};

export default CreateApp;
