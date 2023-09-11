import { useCallback, useState, useEffect } from 'react';
import Diagram from './components/Diagram.jsx';
import 'reactflow/dist/style.css';
import Toolbar from './components/Toolbar';
import axios from 'axios';

function App() {
  const [savedDiagramName, setSavedDiagramName] = useState(null);
  const [diagramBackwardsHistory, setDiagramBackwardsHistory] = useState(['Podium']);
  const [diagramForwardsHistory, setDiagramForwardsHistory] = useState([]);
  const [pendingDiagramChanges, setPendingDiagramChanges] = useState(false);


  const moveDiagramFromBackwardsHistoryToForwardsHistory = useCallback(() => {
    if(diagramBackwardsHistory.length === 1) return;
    const mostRecentBackwardsHistoryDiagram = diagramBackwardsHistory[diagramBackwardsHistory.length - 1];

    const newDiagramForwardsHistory = diagramForwardsHistory.concat(mostRecentBackwardsHistoryDiagram);
    setDiagramForwardsHistory(newDiagramForwardsHistory);

    const newDiagramBackwardsHistory = diagramBackwardsHistory.slice(0, diagramBackwardsHistory.length - 1);
    setDiagramBackwardsHistory(newDiagramBackwardsHistory);
  }, [diagramForwardsHistory, diagramBackwardsHistory]);

  const moveDiagramFromForwardsHistoryToBackwardsHistory = useCallback(() => {
    if(diagramForwardsHistory.length === 0) return;
    const mostRecentForwardsHistoryDiagram = diagramForwardsHistory[diagramForwardsHistory.length - 1];

    const newDiagramForwardsHistory = diagramForwardsHistory.slice(0, diagramForwardsHistory.length - 1);
    setDiagramForwardsHistory(newDiagramForwardsHistory);

    const newDiagramBackwardsHistory = diagramBackwardsHistory.concat(mostRecentForwardsHistoryDiagram);
    setDiagramBackwardsHistory(newDiagramBackwardsHistory);
  }, [diagramForwardsHistory, diagramBackwardsHistory])

  const createNewDiagram = useCallback(async () => {
    const instanceObject = {
      nodes: [],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      },
    }
    await axios.post(`http://localhost:${window.WS_PORT}/flowChart/New Diagram`, instanceObject);
    setDiagramForwardsHistory([]);
    setDiagramBackwardsHistory(diagramBackwardsHistory.concat('New Diagram'));
  }, [diagramBackwardsHistory]);

  const openDiagram = useCallback((diagramName) => {
    setPendingDiagramChanges(false);
    setDiagramForwardsHistory([]);
    setDiagramBackwardsHistory(diagramBackwardsHistory.concat(diagramName));
  }, [diagramBackwardsHistory]);


  const saveDiagram = useCallback((diagramName, diagramDescription, instanceObject, lastUpdated) => {
    if(!diagramName) return;
    if(diagramName !== savedDiagramName) {
      console.log('names do not match');
      // replace the most recent diagram in the backwards history with the new diagram name
      const newDiagramBackwardsHistory = diagramBackwardsHistory.slice(0, diagramBackwardsHistory.length - 1).concat(diagramName);
      setDiagramBackwardsHistory(newDiagramBackwardsHistory);
    }


    instanceObject.lastUpdated = lastUpdated;
    instanceObject.diagramName = diagramName;
    instanceObject.diagramDescription = diagramDescription;

    axios.post(`http://localhost:${window.WS_PORT}/flowChart/${diagramName}`, instanceObject);
    setPendingDiagramChanges(false);
  }, [diagramBackwardsHistory, savedDiagramName]);

  useEffect(() => {
    const newDiagramName = diagramBackwardsHistory[diagramBackwardsHistory.length - 1];
    setSavedDiagramName(newDiagramName);
  }, [diagramBackwardsHistory])

  useEffect(() => {
    const handleMouseDown = (event) => {
      switch(event.button) {
        case 3:
          moveDiagramFromBackwardsHistoryToForwardsHistory();
          break;
          case 4:
          moveDiagramFromForwardsHistoryToBackwardsHistory();
          break;
        default:
          break;
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    }
  }, [moveDiagramFromBackwardsHistoryToForwardsHistory, moveDiagramFromForwardsHistoryToBackwardsHistory]);


  return (
      <>
        <Toolbar createNewDiagram={createNewDiagram} />
        <Diagram
          savedDiagramName={savedDiagramName}
          saveDiagram={saveDiagram}
          createNewDiagram={createNewDiagram}
          openDiagram={openDiagram}
          pendingDiagramChanges={pendingDiagramChanges}
          setPendingDiagramChanges={setPendingDiagramChanges}
        />
      </>
  );
}

export default App;
