import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './BoardEditor.css';

const ItemTypes = {
  CELL: 'cell',
};

const DraggableCell = ({ id, text, index, moveCell, editable, handleEditClick, handleSaveClick, handleTextChange, handleDeleteClick }) => {
  const [, ref] = useDrag({
    type: ItemTypes.CELL,
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CELL,
    hover(item) {
      if (item.index !== index) {
        moveCell(item.index, index);
        item.index = index;
      }
    },
  });

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSaveClick(id, text);
    }
  };

  return (
    <div ref={(node) => ref(drop(node))} className="cell">
      {editable ? (
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(id, e.target.value)}
          onKeyPress={handleKeyPress}
        />
      ) : (
        <span>{text}</span>
      )}
      <button className="edit-button" onClick={() => editable ? handleSaveClick(id, text) : handleEditClick(id)}>
        Edit
      </button>
      <button className="delete-button" onClick={() => handleDeleteClick(id)}>
        -
      </button>
    </div>
  );
};

const BoardEditor = () => {
  const initialCells = [
    { id: 1, text: 'liomsa', editable: false },
    { id: 2, text: 'duirt', editable: false },
    { id: 3, text: 'beir', editable: false },
    { id: 4, text: 'cabhr', editable: false },
    { id: 5, text: 'caith', editable: false },
    { id: 6, text: 'clois', editable: false },
    { id: 7, text: 'chuir', editable: false },
    { id: 8, text: 'crioch', editable: false },
    { id: 9, text: 'mé', editable: false },
    { id: 10, text: 'aimsir', editable: false },
    { id: 11, text: 'scoil', editable: false },
    // Add more cells as needed
  ];
  const [cells, setCells] = useState(initialCells);

  const moveCell = (fromIndex, toIndex) => {
    const updatedCells = [...cells];
    const [movedCell] = updatedCells.splice(fromIndex, 1);
    updatedCells.splice(toIndex, 0, movedCell);
    setCells(updatedCells);
  };

  const handleEditClick = (id) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, editable: true } : cell));
  };

  const handleSaveClick = (id, newText) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, text: newText, editable: false } : cell));
  };

  const handleTextChange = (id, newText) => {
    setCells(cells.map(cell => cell.id === id ? { ...cell, text: newText } : cell));
  };

  const handleAddCell = () => {
    const newCell = { id: cells.length + 1, text: '', editable: true };
    setCells([...cells, newCell]);
  };

  const handleDeleteClick = (id) => {
    setCells(cells.filter(cell => cell.id !== id));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board-editor">
        <div className="board">
          {cells.map((cell, index) => (
            <DraggableCell
              key={cell.id}
              index={index}
              id={cell.id}
              text={cell.text}
              editable={cell.editable}
              moveCell={moveCell}
              handleEditClick={handleEditClick}
              handleSaveClick={handleSaveClick}
              handleTextChange={handleTextChange}
              handleDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
        <button className="add-button" onClick={handleAddCell}>+</button>
      </div>
    </DndProvider>
  );
};

export default BoardEditor;
