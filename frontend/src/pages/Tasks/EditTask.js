import { useState, useEffect } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Button,
  Box,
  Typography,
  TextareaAutosize,
  InputLabel,
  Chip,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Select,
  MenuItem,
} from "@mui/material";

const EditTask = (props) => {
  const { app, task, createTaskPermission } = props;

  // ------------- Fetch task details -------------
  const [taskDetails, setTaskDetails] = useState([]);

  const fetchTaskDetails = async () => {
    const data = await handleGetRequest(`task/task-details/${task}`);
    if (data) {
      setTaskDetails(data);
      setSelectedPlan(data.plan_name ? data.plan_name : "null");
    }
  };

  // ------------- Fetch all notes -------------
  const [allNotes, setAllNotes] = useState([]);

  const fetchAllNotes = async () => {
    const data = await handleGetRequest(`task/all-notes/${task}`);
    if (data) {
      setAllNotes(data);
    }
  };

  // ------------- Fetch all plans -------------
  const [allPlans, setAllPlans] = useState([]);

  const fetchAllPlans = async () => {
    const data = await handleGetRequest(`task/all-open-plans/${app}`);
    if (data) {
      setAllPlans(data);
    }
  };

  // ------------- Check if Member -------------/
  const [isMember, setIsMember] = useState(false);

  const checkMember = async () => {
    const data = await handleGetRequest(`task/is-member/${app}`);
    if (data) {
      setIsMember(data);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
    fetchAllNotes();
    fetchAllPlans();
    checkMember();
  }, []);

  // ------------- Update task details -------------

  const [readOnly, setReadOnly] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleTaskUpdate = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/update-task`, {
      description: e.target.description.value,
      planName: selectedPlan,
      acronym: app,
      taskID: task,
    });
    setMessage(data);
    fetchAllNotes();
    props.fetchTasks();
  };

  const setPermissions = () => {
    if (createTaskPermission && taskDetails.state === "Open") {
      setReadOnly(false);
    }
  };

  useEffect(() => {
    setPermissions();
  }, [taskDetails]);

  const [notesMessage, setNotesMessage] = useState("");

  const handleAddNote = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/create-notes/${task}`, {
      taskID: task,
      details: e.target.notes.value,
      acronym: app,
    });
    if (data !== "Added note") {
      setNotesMessage(data);
    } else {
      setNotesMessage(data);
      e.target.notes.value = "";
      fetchAllNotes();
      fetchTaskDetails();
    }
  };

  return (
    <Card
      sx={{
        minWidth: "120px",
        width: "50vw",
        maxHeight: "90vh",
        overflow: "scroll",
        p: 5,
      }}
    >
      <Typography variant="h2" sx={{ textAlign: "center" }}>
        Task - {taskDetails.task_name}
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Task ID</TableCell>
            <TableCell>Application</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Creator</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Owner</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ border: "none" }}>
              <Chip label={taskDetails.task_id} />
            </TableCell>
            <TableCell sx={{ border: "none" }}>
              <Chip label={taskDetails.acronym} />
            </TableCell>
            <TableCell sx={{ border: "none" }}>
              <Chip label={taskDetails.state} />
            </TableCell>
            <TableCell sx={{ border: "none" }}>
              <Chip label={taskDetails.creator} />
            </TableCell>
            <TableCell sx={{ border: "none" }}>
              <Chip label={taskDetails.create_date?.slice(0, 10)} />
            </TableCell>
            <TableCell sx={{ border: "none" }}>
              <Chip label={taskDetails.owner ? taskDetails.owner : "N/A"} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Box sx={{ display: "flex", justifyContent: "space-around" }}>
        {readOnly ? (
          <>
            <Typography variant="body1">
              Description: {taskDetails.description}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Plan Name:{" "}
              {taskDetails.plan_name
                ? taskDetails.plan_name
                : "No plan allocated"}
            </Typography>
          </>
        ) : (
          <>
            <form
              onSubmit={handleTaskUpdate}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "70%",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                <Box>
                  <InputLabel id="description">Description</InputLabel>
                  <TextareaAutosize
                    id="description"
                    defaultValue={taskDetails.description}
                    maxLength="255"
                    minRows={2}
                  />
                </Box>{" "}
                <Box>
                  <InputLabel id="planName">Plan Name</InputLabel>
                  <Select
                    id="planName"
                    label="Plan Name"
                    value={selectedPlan}
                    onChange={(e) => {
                      setSelectedPlan(e.target.value);
                    }}
                  >
                    <MenuItem value="null">No plan</MenuItem>
                    {allPlans.map((plan) => {
                      return (
                        <MenuItem key={plan.plan_name} value={plan.plan_name}>
                          {plan.plan_name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Box>
              </Box>
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Update task
              </Button>
            </form>
          </>
        )}
        {isMember && taskDetails.state !== "Closed" && (
          <form
            onSubmit={handleAddNote}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <InputLabel id="notes">Add notes</InputLabel>
            <TextareaAutosize id="notes" maxLength="255" minRows={2} required />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Add
            </Button>
          </form>
        )}
      </Box>
      {message}

      <Typography variant="body2" sx={{ mb: 2 }}>
        {notesMessage}
      </Typography>
      {allNotes.map((note) => {
        return (
          <Accordion>
            <AccordionSummary sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1">{note.details}</Typography>
              <Typography
                variant="body1"
                sx={{ position: "absolute", right: 20 }}
              >
                {note.timestamp}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">Author: {note.creator}</Typography>
              <Typography variant="body1">
                Current State: {note.state}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Card>
  );
};

export default EditTask;
