const Toolbar = ({ createNewDiagram, openDiagram }) => {
  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={createNewDiagram}>New</button>
      <button className="toolbar-button" onClick={openDiagram}>Open</button>
    </div>
  );
}

export default Toolbar;