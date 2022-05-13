import { useState, useEffect } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Button,
  Typography,
  TextareaAutosize,
  Chip,
  Card,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@mui/material";

const EditTask = (props) => {
  const { app, task, isLead, setClose } = props;

  // ------------- Fetch task details -------------
  const [taskDetails, setTaskDetails] = useState([]);

  const fetchTaskDetails = async () => {
    const data = await handleGetRequest(`task/task-details/${task}`);
    if (data) {
      setTaskDetails(data);
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
    const data = await handleGetRequest(`task/all-plans/${app}`);
    if (data) {
      setAllPlans(data);
    }
    console.log(data);
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

  const handleTaskUpdate = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/update-task`, {
      description: e.target.description.value,
      planName: e.target.planName.value,
      acronym: app,
      taskID: task,
    });
    setMessage(data);
    fetchAllNotes();
  };

  const setPermissions = () => {
    if (isLead && taskDetails.state === "Open") {
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
    }
  };

  return (
    <Card
      sx={{
        width: "80vw",
        height: "90vh",
        position: "absolute",
        left: "10vw",
        top: "4vh",
        overflow: "scroll",
        p: 1,
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

      <form onSubmit={handleTaskUpdate}>
        {readOnly ? (
          <>
            <Typography variant="body1">
              Description: {taskDetails.description}
            </Typography>
            <Typography variant="body1">
              Plan Name: {taskDetails.plan_name}
            </Typography>
          </>
        ) : (
          <>
            <TextareaAutosize
              id="description"
              defaultValue={taskDetails.description}
              maxLength="255"
              minRows={2}
            />
            <label htmlFor="planName">Plan Name</label>
            <select id="planName" name="planName">
              <option
                value="null"
                selected={taskDetails.plan_name ? true : false}
              >
                No plan
              </option>
              {allPlans.map((plan) => {
                return (
                  <option
                    selected={
                      plan.plan_name === taskDetails.plan_name ? true : false
                    }
                    value={plan.plan_name}
                  >
                    {plan.plan_name}
                  </option>
                );
              })}
            </select>
            <Button type="submit">Update task</Button>
          </>
        )}
      </form>
      {message}
      {isMember && taskDetails.state !== "Closed" && (
        <form
          onSubmit={handleAddNote}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <TextareaAutosize id="notes" maxLength="255" minRows={2} required />
          <Button type="submit">Add notes</Button>
        </form>
      )}
      <Typography variant="body2">{notesMessage}</Typography>
      {allNotes.map((note) => {
        return (
          <Accordion>
            <AccordionSummary>
              <Typography variant="body1">{note.details}</Typography>
              <Typography variant="body1">{note.date.slice(0, 10)}</Typography>
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
