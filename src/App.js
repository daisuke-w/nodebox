import { useState } from 'react';

function Square({ value, onSquareClick, isWinningSquare }) {
  const className = isWinningSquare ? 'square winning' : 'square';
  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const {winner, winnerLine} = calculateWinner(squares);
  function handleClick(i) {
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(square => square !== null)) {
    status = 'Draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  function renderBoard() {
    const board = [];
    for (let row = 0; row < 3; row++) {
      const boardRow = [];
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        const isWinningSquare = winner && winnerLine && winnerLine.includes(index);
        boardRow.push(
          <Square
            key={index}
            value={squares[index]}
            onSquareClick={() => handleClick(index)}
            isWinningSquare={isWinningSquare}
          />
        );
      }
      board.push(
        <div className="board-row" key={row}>
          {boardRow}
        </div>
      );
    }
    return board;
  }

  return (
    <>
      <div className="status">{status}</div>
      {renderBoard()}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), location: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, i) {
    const nextLocation = {
      row: Math.floor(i / 3) + 1,
      col: (i % 3) + 1,
    };
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location: nextLocation }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(prevIsAscending => !prevIsAscending);
  }

  const moves = history.map((step, move) => {
    const location = step.location ? `(row: ${step.location.row}, col: ${step.location.col})` : '';
    const description = move === 0
      ? 'Go to game start'
      : `Go to move #${move} ${location}`;
    return (
      <li key={move}>
        {move === currentMove ? (
          <h6>{description}</h6>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : moves.slice().reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <div className="toggleButton">
          <input id="toggle" type="checkbox" onClick={toggleSortOrder} />
          <label htmlFor="toggle" />
        </div>
        <ol reversed={!isAscending}>{sortedMoves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], winnerLine: lines[i]};
    }
  }
  return {winner: null, winnerLine: null};
}