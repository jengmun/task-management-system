import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Card,
  Button,
  Typography,
  TextField,
  TextareaAutosize,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import moment from "moment";
import CustomSnackbar from "../../components/CustomSnackbar";

const EditApp = (props) => {
  const { app } = useParams();

  // ------------- Fetch app details -------------
  const [appDetails, setAppDetails] = useState([]);

  const fetchAppDetails = async () => {
    const data = await handleGetRequest(`task/apps/${app}`);
    if (data) {
      setAppDetails(data);
      if (!selectedPermissions.permitCreate) {
        setSelectedPermissions({
          permitCreate: data.permit_create,
          permitOpen: data.permit_open,
          permitTodo: data.permit_todo,
          permitDoing: data.permit_doing,
          permitDone: data.permit_done,
        });
      }
    }
  };

  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  useEffect(() => {
    fetchAppDetails();
    fetchAllGroups();
  }, []);

  const permissions = [
    "permitCreate",
    "permitOpen",
    "permitTodo",
    "permitDoing",
    "permitDone",
  ];

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

  const handleEditApp = async (e) => {
    e.preventDefault();

    if (
      new Date(e.target.endDate.value) - new Date(e.target.startDate.value) <
      0
    ) {
      setMessage("End date must be later than start date!");
      handleOpenSnackbar("error");
      return;
    }

    const data = await handlePostRequest(`task/update-app/${app}`, {
      description: e.target.description.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      permitCreate: selectedPermissions.permitCreate,
      permitOpen: selectedPermissions.permitOpen,
      permitTodo: selectedPermissions.permitTodo,
      permitDoing: selectedPermissions.permitDoing,
      permitDone: selectedPermissions.permitDone,
    });
    setMessage(data.message);

    if (data.message === "Updated app") {
      props.fetchAppDetails();
      handleOpenSnackbar("success");
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
        backgroundColor: "white",
        overflowY: "scroll",
      }}
    >
      <Typography variant="h4" sx={{ textAlign: "center", mb: 2 }}>
        {app}
      </Typography>
      {appDetails.end_date && (
        <form
          onSubmit={handleEditApp}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <TextareaAutosize
            required
            maxLength="255"
            minRows={3}
            id="description"
            defaultValue={appDetails.description}
          />
          <TextField
            id="startDate"
            label="Start Date"
            variant="outlined"
            type="date"
            required
            defaultValue={moment(appDetails.start_date).format("YYYY-MM-DD")}
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            id="endDate"
            label="End Date"
            variant="outlined"
            required
            type="date"
            InputProps={{ inputProps: { min: startDate } }}
            defaultValue={moment(appDetails.end_date).format("YYYY-MM-DD")}
            sx={{ mt: 2, mb: 2 }}
          />
          <Typography variant="h6">Assign Task Permissions</Typography>
          {permissions.map((permission) => {
            return (
              <FormControl key={permission} sx={{ mt: 2 }}>
                <InputLabel id={permission}>{`${permission.slice(
                  6
                )}`}</InputLabel>
                <Select
                  label={permission}
                  id={permission}
                  sx={{ width: "200px" }}
                  MenuProps={{
                    sx: { ".MuiList-root": { backgroundColor: "white" } },
                  }}
                  value={
                    allGroups.length ? selectedPermissions[permission] : ""
                  }
                  onChange={(e) => {
                    setSelectedPermissions({
                      ...selectedPermissions,
                      [permission]: e.target.value,
                    });
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
          <Button
            type="submit"
            variant="contained"
            color="success"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </form>
      )}
      <CustomSnackbar
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Card>
  );
};

export default EditApp;
