import Board, { moveCard } from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";
import { useEffect, useState } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const KanbanBoard = () => {
  const [allTasks, setAllTasks] = useState([]);

  const app = "APP";
  //   change to indiv app
  const fetchTasks = async () => {
    const data = await handleGetRequest(`task/${app}/all-tasks`);
    setAllTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  //   Create Kanban Board
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
    // const oldState = states[source.fromColumnId];
    // const newState = states[destination.toColumnId];
    // console.log(oldState, newState);

    let data;

    if (Math.abs(destination.toColumnId - source.fromColumnId) !== 1) {
      return;
    }

    if (destination.toColumnId > source.fromColumnId) {
      //   Query / Update database
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

    if (data === "Insufficient permissions") {
      return;
    }
    console.log(data);

    if (data !== "State updated" && data !== "State demoted") {
      return;
    }
    // Update board
    const updatedBoard = moveCard(board, source, destination);
    setBoard(updatedBoard);
  };

  return (
    <div>
      <Board onCardDragEnd={handleCardMove} disableColumnDrag>
        {board}
      </Board>
    </div>
  );
};

export default KanbanBoard;
