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
} from "@mui/material";

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

  const [message, setMessage] = useState("");

  const handleCreateApp = async (e) => {
    e.preventDefault();

    for (const permission of permissions) {
      if (!selectedPermissions[permission] || !newApp) {
        setMessage("Please fill in all details");
        return;
      }
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
    props.fetchAllApps();
  };

  const [startDate, setStartDate] = useState("");

  return (
    <Card
      sx={{
        p: 3,
        width: "max-content",
        maxHeight: "90vh",
        overflow: "scroll",
      }}
    >
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
          >
            {uncreatedApps.map((app) => {
              return (
                <MenuItem value={app} key={app}>
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
          defaultValue={new Date().toISOString().slice(0, 10)}
          sx={{ mt: 2 }}
        />
        <TextField
          id="endDate"
          label="End Date"
          variant="outlined"
          required
          type="date"
          InputProps={{ inputProps: { min: startDate } }}
          defaultValue={new Date().toISOString().slice(0, 10)}
          sx={{ mt: 2 }}
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
              >
                {allGroups.map((group) => {
                  return (
                    <MenuItem value={group.group_name} key={group.group_name}>
                      {group.group_name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          );
        })}
        <Button type="submit">Submit</Button>
        <Typography variant="body1">{message}</Typography>
      </Box>
    </Card>
  );
};

export default CreateApp;
