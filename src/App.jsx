import { useCallback, useState, useEffect } from 'react';
import Diagram from './components/Diagram.jsx';
import 'reactflow/dist/style.css';
import Toolbar from './components/Toolbar';

function App() {
  const [savedDiagramName, setSavedDiagramName] = useState(null);
  const [diagramBackwardsHistory, setDiagramBackwardsHistory] = useState([]);
  const [diagramForwardsHistory, setDiagramForwardsHistory] = useState([]);


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
    setDiagramBackwardsHistory(diagramBackwardsHistory.concat('New Diagram'));
  }, [diagramBackwardsHistory]);

  const openDiagram = useCallback((diagramName) => {
    setDiagramBackwardsHistory(diagramBackwardsHistory.concat(diagramName));
  }, [diagramBackwardsHistory]);


  const saveDiagram = useCallback((diagramName, diagramDescription, instanceObject) => {
    if(!diagramName) return;
    if(diagramName !== savedDiagramName) {
      console.log('names do not match');
      // replace the most recent diagram in the backwards history with the new diagram name
      const newDiagramBackwardsHistory = diagramBackwardsHistory.slice(0, diagramBackwardsHistory.length - 1).concat(diagramName);
      setDiagramBackwardsHistory(newDiagramBackwardsHistory);
    }
    const formatDate = (date) => {
      // ex. Wednesday, March 22 at 4:30 PM UTC
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'];
      const day = days[date.getDay()];
      const month = months[date.getMonth()];
      const dayOfMonth = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      const formattedMinute = minute < 10 ? `0${minute}` : minute;
      return `${day}, ${month} ${dayOfMonth} at ${formattedHour}:${formattedMinute} ${ampm} UTC`;
    };
    const lastUpdated = formatDate(new Date());

    instanceObject.lastUpdated = lastUpdated;
    instanceObject.diagramName = diagramName;
    instanceObject.diagramDescription = diagramDescription;

    localStorage.setItem(diagramName, JSON.stringify(instanceObject));
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
        />
      </>
  );
}

export default App;
