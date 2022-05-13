import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextareaAutosize,
  TextField,
} from "@mui/material";

const CreateApp = () => {
  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
    console.log(data);
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);

  const permissions = [
    "permitCreate",
    "permitOpen",
    "permitTodo",
    "permitDoing",
    "permitDone",
  ];

  const handleCreateApp = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("task/create-app", {
      acronym: e.target.acronym.value,
      description: e.target.description.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      permitCreate: e.target.permitCreate.value,
      permitOpen: e.target.permitOpen.value,
      permitTodo: e.target.permitTodo.value,
      permitDoing: e.target.permitDoing.value,
      permitDone: e.target.permitDone.value,
    });
    console.log(data);
  };
  const [startDate, setStartDate] = useState("");

  return (
    <>
      <NavLink to="/" style={{ textDecoration: "none" }}>
        <Button>Back</Button>
      </NavLink>
      <Box
        onSubmit={handleCreateApp}
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TextField
          required
          InputProps={{ inputProps: { minLength: 3, maxLength: 3 } }}
          id="acronym"
          label="Application Acronym"
          sx={{ mt: 1, mb: 1 }}
        />
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
        {permissions.map((permission) => {
          return (
            <FormControl>
              <InputLabel id={permission}>{permission}</InputLabel>
              <Select
                id={permission}
                labelId={permission}
                label={permission}
                sx={{ width: "min-content" }}
              >
                {allGroups.map((group) => {
                  return (
                    <MenuItem value={group.group_name}>
                      {group.group_name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          );
        })}
        <Button type="submit">Submit</Button>
      </Box>
    </>
  );
};

export default CreateApp;
