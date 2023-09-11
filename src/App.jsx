import { useCallback, useState, useEffect } from 'react';
import Diagram from './components/Diagram.jsx';
import 'reactflow/dist/style.css';
import Toolbar from './components/Toolbar';

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

  const createNewDiagram = useCallback(() => {
    const instanceObject = {
      nodes: [],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      },
    }
    localStorage.setItem('New Diagram', JSON.stringify(instanceObject));
    setDiagramForwardsHistory([]);
    setDiagramBackwardsHistory(diagramBackwardsHistory.concat('New Diagram'));
  }, [diagramBackwardsHistory]);
  

  const diagramExists = useCallback((diagramName) => {
    for (const key in localStorage) {
      if(key === diagramName) return true;
    }
    return false;
  }, []);

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

    localStorage.setItem(diagramName, JSON.stringify(instanceObject));
    setPendingDiagramChanges(false);
  }, [diagramBackwardsHistory, savedDiagramName]);

  useEffect(() => {
    const newDiagramName = diagramBackwardsHistory[diagramBackwardsHistory.length - 1];
    setSavedDiagramName(newDiagramName);
  }, [diagramBackwardsHistory])

  useEffect(() => {
    console.log('diagram backwards history: ', diagramBackwardsHistory);
    console.log('diagram forwards history: ', diagramForwardsHistory);
  }, [diagramForwardsHistory, diagramBackwardsHistory]);


  // useEffect(() => {
  //   for (const key in localStorage) {
  //     console.log(key);
  //     if(key !== 'Banking System') localStorage.removeItem(key);
  //   }
  //   console.log(localStorage)
  // }, []);

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
