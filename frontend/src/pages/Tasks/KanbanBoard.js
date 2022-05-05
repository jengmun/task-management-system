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

  const handleCardMove = (card, source, destination) => {
    // Update board
    const oldState = states[source.fromColumnId];
    const newState = states[destination.toColumnId];
    console.log(oldState, newState);

    const updatedBoard = moveCard(board, source, destination);
    setBoard(updatedBoard);

    //   Update database
    if (destination.toColumnId > source.fromColumnId) {
      handlePostRequest("task/task-state-progression", {
        taskID: card.id,
        acronym: app,
      });
    } else {
      handlePostRequest("task/task-state-regression", {
        taskID: card.id,
        acronym: app,
      });
    }
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
