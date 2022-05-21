import Board, { moveCard } from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import EditTask from "./EditTask";
import CreatePlan from "./CreatePlan";
import "./kanban.css";
import EditPlan from "./EditPlan";
import EditApp from "./EditApp";
import CreateTask from "./CreateTask";
import {
  Box,
  Button,
  Typography,
  Card,
  Modal,
  Chip,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import moment from "moment";
import CustomSnackbar from "../../components/CustomSnackbar";

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

  // ------------- Check permission to Create Task -------------
  const [createTaskPermission, setCreateTaskPermission] = useState(false);

  const checkCreateTaskPermission = async () => {
    const data = await handlePostRequest("task/check-permissions", {
      app: app,
      permission: "permit_create",
    });

    setCreateTaskPermission(data);
  };

  // ------------- Fetch user permissions -------------
  const [userPermissions, setUserPermissions] = useState([]);
  const [isPM, setIsPM] = useState(false);

  const fetchUserPermissions = async () => {
    const data = await handleGetRequest(`task/get-permissions/${app}`);

    setUserPermissions(data);

    if (
      data.some((permission) => permission.group_name === "Project Manager")
    ) {
      setIsPM(true);
    }
  };

  useEffect(() => {
    fetchAppDetails();
    fetchTasks();
    fetchAllPlans();
    checkCreateTaskPermission();
    fetchUserPermissions();
  }, []);

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

    setMessage(data);

    if (data !== "Added note") {
      handleOpenSnackbar("error");
      return;
    } else {
      handleOpenSnackbar("success");
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

  const theme = useTheme();

  return (
    <Box sx={{ width: "100%" }}>
      <NavLink
        to={`/`}
        style={{
          textDecoration: "none",
          position: "fixed",
          left: "6vw",
          top: "0.5vh",
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: theme.palette.background.default,
            ":hover": { backgroundColor: theme.palette.primary.light },
          }}
        >
          Back
        </Button>
      </NavLink>
      {/* ================== PLANS ================== */}
      <Box
        sx={{
          textAlign: "center",
          flexDirection: "column",
          width: "10vw",
          position: "fixed",
          top: "calc(2vh + 36.5px)",
          left: "5vw",
          maxHeight: "90%",
          overflowY: "scroll",
          backgroundColor: theme.palette.background.paper,
          borderRadius: "15px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.33)",
          "::-webkit-scrollbar": {
            width: "8px",
            borderRadius: "15px",
          },
          "::-webkit-scrollbar-thumb": {
            backgroundColor: "white",
            borderRadius: "15px",
          },
        }}
      >
        <Typography variant="h6" sx={{ mt: 2 }}>
          Plans
        </Typography>

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
                    <div>
                      Start Date: {moment(plan.start_date).format("YYYY-MM-DD")}
                    </div>
                    <div>
                      End Date: {moment(plan.end_date).format("YYYY-MM-DD")}
                    </div>
                  </>
                }
                sx={{ mb: 0.5 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    pr: 0.5,
                    pl: 0.5,
                    color: theme.palette.primary.dark,
                  }}
                >
                  {plan.plan_name}
                </Typography>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          ml: "11vw",
          mr: "1vw",
          borderRadius: "20px",
          mt: "2vh",
          pt: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* ================== APP ================== */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "10px",
              p: 2,
              mr: 2,
              mb: 2,
              backgroundImage: `linear-gradient(to bottom, rgb(249 248 244), #f7e2e2)`,
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.33)",
            }}
          >
            <Typography variant="h2" sx={{ textAlign: "center" }}>
              {app}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              {`${moment(appDetails.start_date).format("YYYY-MM-DD")} -
        ${moment(appDetails.end_date).format("YYYY-MM-DD")}`}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              {appDetails.description}
            </Typography>
            {/* ================== PERMISSIONS ================== */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "10px",
                mr: 2,
                mt: 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-around",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    backgroundColor: "rgb(119 180 207)",
                    border: userPermissions.find(
                      ({ group_name }) =>
                        group_name === appDetails.permit_create
                    )
                      ? "2px solid black"
                      : null,
                    p: 1,
                    mb: 1,
                    mr: 1,
                    borderRadius: "7px",
                    width: "17%",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "white" }}>
                    CREATE
                  </Typography>
                  <Chip
                    label={appDetails.permit_create}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    backgroundColor: "rgb(134 169 219)",
                    border: userPermissions.find(
                      ({ group_name }) => group_name === appDetails.permit_open
                    )
                      ? "2px solid black"
                      : null,
                    p: 1,
                    mb: 1,
                    mr: 1,
                    borderRadius: "7px",
                    width: "17%",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "white" }}>
                    OPEN
                  </Typography>
                  <Chip
                    label={appDetails.permit_open}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    backgroundColor: "rgb(190 164 215)",
                    border: userPermissions.find(
                      ({ group_name }) => group_name === appDetails.permit_todo
                    )
                      ? "2px solid black"
                      : null,
                    p: 1,
                    mb: 1,
                    mr: 1,
                    borderRadius: "7px",
                    width: "17%",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "white" }}>
                    TODO
                  </Typography>
                  <Chip
                    label={appDetails.permit_todo}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    backgroundColor: "rgb(199 147 203)",
                    border: userPermissions.find(
                      ({ group_name }) => group_name === appDetails.permit_doing
                    )
                      ? "2px solid black"
                      : null,
                    p: 1,
                    mb: 1,
                    mr: 1,
                    borderRadius: "7px",
                    width: "17%",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "white" }}>
                    DOING
                  </Typography>
                  <Chip
                    label={appDetails.permit_doing}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    backgroundColor: "rgb(235 168 179)",
                    border: userPermissions.find(
                      ({ group_name }) => group_name === appDetails.permit_done
                    )
                      ? "2px solid black"
                      : null,
                    p: 1,
                    mb: 1,
                    mr: 1,
                    borderRadius: "7px",
                    width: "17%",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", color: "white" }}>
                    DONE
                  </Typography>
                  <Chip
                    label={appDetails.permit_done}
                    sx={{ backgroundColor: theme.palette.background.default }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ================== MODALS ================== */}
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
          </>
        )}
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
          </>
        )}
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
          </Box>
        )}

        {/* ================== BOARD ================== */}
        <Board
          renderCard={(content) => (
            <TaskCard content={content} fetchTasks={fetchTasks} />
          )}
          onCardDragEnd={handleCardMove}
          disableColumnDrag
        >
          {board}
        </Board>
      </Box>

      {/* ================== SPEED DIAL ================== */}
      {(isPM || createTaskPermission) && (
        <SpeedDial
          ariaLabel="SpeedDial"
          icon={<SpeedDialIcon />}
          sx={{ position: "fixed", bottom: "3%", right: "3%" }}
          FabProps={{
            sx: {
              bgcolor: "error.main",
              ":hover": {
                bgcolor: "info.main",
              },
            },
          }}
        >
          {createTaskPermission && (
            <SpeedDialAction
              key="Create Task"
              tooltipTitle="Create Task"
              icon={<AddIcon />}
              onClick={() => {
                setOpenCreateTask(true);
              }}
            />
          )}
          {isPM && (
            <SpeedDialAction
              key="Create Plan"
              tooltipTitle="Create Plan"
              icon={<NoteAddRoundedIcon />}
              onClick={() => {
                setOpenCreatePlan(true);
              }}
            />
          )}
          {isPM && (
            <SpeedDialAction
              key="Edit Plan"
              tooltipTitle="Edit Plan"
              icon={<EditRoundedIcon />}
              onClick={() => {
                setOpenEditPlan(true);
              }}
            />
          )}
          {isPM && (
            <SpeedDialAction
              key="Edit App"
              tooltipTitle="Edit App"
              icon={<AppRegistrationIcon />}
              onClick={() => {
                setOpenEditApp(true);
              }}
            />
          )}
        </SpeedDial>
      )}
      <CustomSnackbar
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Box>
  );
};

export default KanbanBoard;

const TaskCard = (props) => {
  const { app } = useParams();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        sx={{
          p: 2,
          width: "calc(13vw - 30px)",
          mb: 1,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.33)",
          transition: "background-color 0.5s, transform 0.5s",
          ":hover": {
            backgroundColor: "rgb(255, 255, 255)",
            transform: "scale(1.1)",
          },
        }}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Typography variant="body1">{props.content.title}</Typography>
          <Typography variant="body2">{props.content.planName}</Typography>
        </Box>
      </Card>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <EditTask
          app={app}
          task={props.content.id}
          createTaskPermission={props.content.createTaskPermission}
          fetchTasks={props.fetchTasks}
        />
      </Modal>
    </>
  );
};
