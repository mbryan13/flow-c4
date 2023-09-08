const Toolbar = ({ createNewDiagram }) => {
  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={createNewDiagram}>New Doc</button>
    </div>
  );
}

export default Toolbar;