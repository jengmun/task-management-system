import Board, { moveCard } from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const KanbanBoard = () => {
  const { app } = useParams();

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

  // ------------- Check if Lead -------------/
  const [isLead, setIsLead] = useState(false);

  const checkLead = async () => {
    const data = await handlePostRequest("task/is-group", {
      group: "Team Lead",
      acronym: app,
    });
    if (data) {
      setIsLead(data);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAllPlans();
    checkPM();
    checkLead();
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
  }, [allTasks]);

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

    console.log(data);

    if (data !== "Added note") {
      return;
    }
    // ------------- Update Board -------------
    const updatedBoard = moveCard(board, source, destination);
    setBoard(updatedBoard);
  };

  return (
    <div>
      <NavLink to={`/`}>
        <button>Back</button>
      </NavLink>
      <h1>{app}</h1>
      {isPM && (
        <NavLink to={`/app/${app}/edit-app`}>
          <button>Edit app</button>
        </NavLink>
      )}
      <h2>All Plans:</h2>
      {isPM && (
        <NavLink to={`/app/${app}/edit-plan`}>
          <button>Edit plans</button>
        </NavLink>
      )}
      {allPlans.map((plan) => {
        return <h5 key={plan.plan_name}>{plan.plan_name}</h5>;
      })}
      {isPM && (
        <NavLink to={`/app/${app}/create-plan`}>
          <button>Create Plan</button>
        </NavLink>
      )}
      {isLead && (
        <NavLink to={`/app/${app}/create-task`}>
          <button>Create Task</button>
        </NavLink>
      )}
      <Board
        renderCard={(content) => <Card content={content} />}
        onCardDragEnd={handleCardMove}
        disableColumnDrag
      >
        {board}
      </Board>
    </div>
  );
};

export default KanbanBoard;

const Card = (props) => {
  const { app } = useParams();

  const [message, setMessage] = useState("");

  // ------------- Check if Member -------------/
  const [isMember, setIsMember] = useState(false);

  const checkMember = async () => {
    const data = await handleGetRequest(`task/is-member/${app}`);
    if (data) {
      setIsMember(data);
    }
  };

  useEffect(() => {
    checkMember();
  }, []);

  const handleAddNote = async (e) => {
    e.preventDefault();
    const data = await handlePostRequest(
      `task/create-notes/${props.content.id}`,
      {
        taskID: props.content.id,
        details: e.target.notes.value,
        acronym: app,
      }
    );

    if (data !== "Added note") {
      setMessage("Note could not be added. ");
    } else {
      setMessage(data);
      e.target.notes.value = "";
    }
  };

  return (
    <div>
      <h4>{props.content.title}</h4>
      <h5>Plan: {props.content.planName}</h5>
      <h5>{props.content.description}</h5>
      {isMember && props.content.state !== "Closed" && (
        <form onSubmit={handleAddNote}>
          <textarea id="notes" name="notes" maxLength="255" required />
          <button>Add notes</button>
        </form>
      )}

      {message}
      <NavLink to={`/app/${app}/${props.content.id}/edit-task`}>
        <button>View details</button>
      </NavLink>
    </div>
  );
};
