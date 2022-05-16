import Board, { moveCard } from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import EditTask from "./EditTask";
import CreatePlan from "./CreatePlan";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Typography,
  Card,
  Modal,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Tooltip,
} from "@mui/material";
import "./kanban.css";
import EditPlan from "./EditPlan";
import EditApp from "./EditApp";
import CreateTask from "./CreateTask";

const KanbanBoard = () => {
  const { app } = useParams();

  // ------------- Fetch app details -------------
  const [appDetails, setAppDetails] = useState([]);

  const fetchAppDetails = async () => {
    const data = await handleGetRequest(`task/apps/${app}`);
    if (data) {
      setAppDetails(data);
    }
  };

  // ------------- Fetch all tasks -------------
  const [allTasks, setAllTasks] = useState([]);

  const fetchTasks = async () => {
    const data = await handleGetRequest(`task/all-tasks/${app}`);
    if (data) {
      setAllTasks(data);
    }
  };

  // ------------- Fetch all plans -------------
  const [allPlans, setAllPlans] = useState([]);

  const fetchAllPlans = async () => {
    const data = await handleGetRequest(`task/all-plans/${app}`);
    if (data) {
      setAllPlans(data);
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

  // ------------- Check permission to Create Task -------------
  const [createTaskPermission, setCreateTaskPermission] = useState(false);

  const checkCreateTaskPermission = async () => {
    const data = await handlePostRequest("task/check-permissions", {
      app: app,
      permission: "permit_create",
    });

    setCreateTaskPermission(data);
  };

  useEffect(() => {
    fetchAppDetails();
    fetchTasks();
    fetchAllPlans();
    checkPM();
    checkCreateTaskPermission();
  }, []);

  // ------------- Create Kanban Board -------------
  const [board, setBoard] = useState({ columns: [] });
  const states = ["Open", "Todo", "Doing", "Done", "Closed"];

  const createBoard = () => {
    const columns = [];

    const createColumn = (id, title) => {
      const numOfCards = allTasks.filter((task) => {
        return task.state === states[id];
      });

      const cards = [];

      for (let i = 0; i < numOfCards.length; i++) {
        cards.push({
          id: numOfCards[i].task_id,
          title: numOfCards[i].task_name,
          description: numOfCards[i].description,
          planName: numOfCards[i].plan_name,
          state: numOfCards[i].state,
          creator: numOfCards[i].creator,
          owner: numOfCards[i].owner,
          createTaskPermission: createTaskPermission,
        });
      }
      columns.push({ id, title, cards });
    };

    for (let i = 0; i < states.length; i++) {
      createColumn(i, states[i]);
    }

    board.columns = columns;
    setBoard({ ...board });
  };

  useEffect(() => {
    createBoard();
  }, [allTasks, createTaskPermission]);

  const handleCardMove = async (card, source, destination) => {
    let data;

    if (Math.abs(destination.toColumnId - source.fromColumnId) !== 1) {
      return;
    }

    if (destination.toColumnId > source.fromColumnId) {
      // ------------- Query / Update Database -------------
      data = await handlePostRequest("task/task-state-progression", {
        taskID: card.id,
        acronym: app,
      });
    } else {
      data = await handlePostRequest("task/task-state-regression", {
        taskID: card.id,
        acronym: app,
      });
    }

    if (data !== "Added note") {
      return;
    }
    // ------------- Update Board -------------
    const updatedBoard = moveCard(board, source, destination);
    setBoard(updatedBoard);
  };

  // ------------- Modals -------------
  const [openEditApp, setOpenEditApp] = useState(false);
  const [openCreatePlan, setOpenCreatePlan] = useState(false);
  const [openEditPlan, setOpenEditPlan] = useState(false);
  const [openCreateTask, setOpenCreateTask] = useState(false);

  return (
    <Box>
      <NavLink to={`/`} style={{ textDecoration: "none" }}>
        <Button>Back</Button>
      </NavLink>
      <Typography variant="h2" sx={{ textAlign: "center" }}>
        {app}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center" }}>
        {`${appDetails.start_date?.slice(0, 10)} -
        ${appDetails.end_date?.slice(0, 10)}`}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: "center" }}>
        {appDetails.description}
      </Typography>
      {/* ------------- APP ------------- */}
      <div style={{ textAlign: "center" }}>
        {isPM && (
          <>
            <Modal
              open={openEditApp}
              onClose={() => {
                setOpenEditApp(false);
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EditApp fetchAppDetails={fetchAppDetails} />
            </Modal>
            <Button
              onClick={() => {
                setOpenEditApp(true);
              }}
            >
              Edit app
            </Button>
          </>
        )}

        <Typography variant="h5">Permissions</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Create</TableCell>
              <TableCell>Open</TableCell>
              <TableCell>Todo</TableCell>
              <TableCell>Doing</TableCell>
              <TableCell>Done</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ border: "none" }}>
                <Typography variant="body1">
                  {appDetails.permit_create}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: "none" }}>
                <Typography variant="body1">
                  {appDetails.permit_open}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: "none" }}>
                <Typography variant="body1">
                  {appDetails.permit_todo}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: "none" }}>
                <Typography variant="body1">
                  {appDetails.permit_doing}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: "none" }}>
                <Typography variant="body1">
                  {appDetails.permit_done}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {/* ------------- PLANS ------------- */}
      <div
        style={{
          textAlign: "center",
          flexDirection: "column",
          width: "15vw",
          position: "absolute",
          left: 0,
        }}
      >
        <Typography variant="h5">Plans</Typography>
        {isPM && (
          <Box>
            <Modal
              open={openCreatePlan}
              onClose={() => {
                setOpenCreatePlan(false);
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CreatePlan fetchAllPlans={fetchAllPlans} />
            </Modal>
            <Button
              onClick={() => {
                setOpenCreatePlan(true);
              }}
            >
              Create Plan
            </Button>
            <Modal
              open={openEditPlan}
              onClose={() => {
                setOpenEditPlan(false);
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EditPlan fetchAllPlans={fetchAllPlans} />
            </Modal>

            <Button
              onClick={() => {
                setOpenEditPlan(true);
              }}
            >
              Edit plans
            </Button>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {allPlans.map((plan, i) => {
            return (
              <Tooltip
                key={i}
                title={
                  <>
                    <div>Status: {plan.status}</div>
                    <div>Start Date: {plan.start_date.slice(0, 10)}</div>
                    <div>End Date: {plan.end_date.slice(0, 10)}</div>
                  </>
                }
              >
                <Chip label={plan.plan_name} />
              </Tooltip>
            );
          })}
        </Box>
      </div>
      {/* ------------- TASKS ------------- */}
      {createTaskPermission && (
        <>
          <Modal
            open={openCreateTask}
            onClose={() => {
              setOpenCreateTask(false);
            }}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CreateTask fetchTasks={fetchTasks} />
          </Modal>
          <Button
            onClick={() => {
              setOpenCreateTask(true);
            }}
          >
            Create Task
          </Button>
        </>
      )}
      <Board
        renderCard={(content) => <TaskCard content={content} />}
        onCardDragEnd={handleCardMove}
        disableColumnDrag
      >
        {board}
      </Board>
    </Box>
  );
};

export default KanbanBoard;

const TaskCard = (props) => {
  const { app } = useParams();

  const [open, setOpen] = useState(false);

  return (
    <Card sx={{ p: 2, mt: 2, width: "100%" }}>
      <Box
        onClick={() => {
          setOpen(true);
        }}
      >
        <Typography variant="h6">{props.content.title}</Typography>
        <Typography variant="body1">Plan: {props.content.planName}</Typography>
        <Typography variant="body1">{props.content.description}</Typography>
      </Box>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <EditTask
          app={app}
          task={props.content.id}
          createTaskPermission={props.content.createTaskPermission}
          setClose={() => {
            setOpen(false);
          }}
        />
      </Modal>
    </Card>
  );
};
