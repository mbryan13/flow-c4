import React, { useCallback } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, useReactFlow, ReactFlowProvider, MarkerType, Background } from 'reactflow';

import 'reactflow/dist/style.css';
import GenericNode from './nodes/GenericNode';
import Toolbar from './components/Toolbar';

const nodeTypes = {
  genericNode: GenericNode,
};

function App() {
  const reactFlowWrapper = React.useRef(null);
  const reactFlowInstance = useReactFlow();
  const { project, setViewport } = reactFlowInstance;
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const [diagramName, setDiagramName] = React.useState(null);
  const [savedDiagramName, setSavedDiagramName] = React.useState(null);
  const [diagramLastUpdated, setDiagramLastUpdated] = React.useState('');
  const [diagramDescription, setDiagramDescription] = React.useState('');
  const [diagramBackwardsHistory, setDiagramBackwardsHistory] = React.useState([]);
  const [diagramForwardsHistory, setDiagramForwardsHistory] = React.useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [lineType, setLineType] = React.useState('straight');
  const [selectedNode, setSelectedNode] = React.useState();

  const onConnect = React.useCallback((params) => setEdges((eds) => {
    console.log(params, eds)
    return addEdge({...params, type: lineType,  animated: true, markerStart: { type: MarkerType.ArrowClosed, color: 'black' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'black' },
  }, eds)
  }), [setEdges]);

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

  const createNewDiagram = React.useCallback(() => {
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

  React.useEffect(() => {
    const newDiagramName = diagramBackwardsHistory[diagramBackwardsHistory.length - 1];
    console.log('new diagram name: ', newDiagramName);
    setDiagramDescription('');
    setSavedDiagramName(newDiagramName);
    setDiagramName(newDiagramName);
  }, [diagramBackwardsHistory])

  React.useEffect(() => {
    console.log('diagram backwards history: ', diagramBackwardsHistory);
    console.log('diagram forwards history: ', diagramForwardsHistory);
  }, [diagramForwardsHistory, diagramBackwardsHistory]);

  React.useEffect(() => {
    // console.log('loading diagram: ', savedDiagramName);
    if(!savedDiagramName) return;
    const diagram = localStorage.getItem(savedDiagramName);
    if(!diagram) return;
    console.log('loading diagram: ', savedDiagramName);
    const parsedDiagram = JSON.parse(diagram);
    parsedDiagram.nodes.forEach((node) => {
      node.data?.functions?.forEach((funcName) => {
        node.data[funcName] = nodeFunctions[funcName];
      });
    });
    setNodes(parsedDiagram.nodes)
    setEdges(parsedDiagram.edges)
    setViewport(parsedDiagram.viewport);
    setDiagramLastUpdated(parsedDiagram.lastUpdated);
    setDiagramDescription(parsedDiagram.diagramDescription);
  
  }, [savedDiagramName]);


  const onEdgeClick = React.useCallback((event, edge) => {
    if(!event.ctrlKey) return;
    const newEdges = edges.filter((e) => e.id !== edge.id);
    setEdges(newEdges);
  }, [edges, setEdges]);

  // React.useEffect(() => {
  //   for (const key in localStorage) {
  //     console.log(key);
  //     if(key !== 'Bkanking System') localStorage.removeItem(key);
  //   }
  //   console.log(localStorage)
  // }, []);

  const modifyText = React.useCallback((event, textType, nodeID) => {
    const inputText = event.target.value;
    setNodes((currentNodes) => {
      const newNodes = currentNodes.map((node) => {
        if(node.id !== nodeID) return node;
        return {
          ...node,
          data: {
            ...node.data,
            [textType]: inputText
          }
        }
      });
      return newNodes;
    });
  }, []);

  const saveDiagram = useCallback((diagramName, diagramDescription) => {
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
    const instanceObject = reactFlowInstance.toObject();
    const lastUpdated = formatDate(new Date());

    setDiagramLastUpdated(lastUpdated);

    instanceObject.lastUpdated = lastUpdated;
    instanceObject.diagramName = diagramName;
    instanceObject.diagramDescription = diagramDescription;

    console.log('saving to local storage: ', diagramName);
    localStorage.setItem(diagramName, JSON.stringify(instanceObject));
  }, [reactFlowInstance, diagramBackwardsHistory, savedDiagramName]);

  const nodeFunctions = {
    modifyText
  }

  const handleDiagramNameChange = React.useCallback((event) => {
    if(event.key !== 'Enter') return setDiagramName(event.target.value);
    console.log(localStorage)
    saveDiagram(diagramName, diagramDescription);
  }, [setDiagramName, diagramName, diagramDescription, saveDiagram]);



  React.useEffect(() => {
    const intervalID = setInterval(() => saveDiagram(diagramName, diagramDescription), 10000); 
    return () => {
      clearInterval(intervalID);
    }
  }, [saveDiagram, diagramName, diagramDescription, savedDiagramName]);

  const onNodeClick = React.useCallback((event, node) => {
    if(!event.ctrlKey || !event.shiftKey) return;
    const newNodes = nodes.filter((n) => n.id !== node.id);
    setNodes(newNodes);
    const newEdges = edges.filter((e) => e.source !== node.id && e.target !== node.id);
    setEdges(newEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const onNodeMouseEnter = React.useCallback((event, node) => {
    setSelectedNode(node);
  });

  const onNodeMouseLeave = React.useCallback((event, node) => {
    setSelectedNode({id: '-1'});
  });


  React.useEffect(() => {
    if(!selectedNode) return;
    setNodes((currentNodes) => {
      const newNodes = currentNodes.map((node) => {
        const isHovered = node.id === selectedNode.id;
          return {
            ...node,
            data: {
              ...node.data,
              isHovered
            }
          }      
      });
      return newNodes;
    });
  }, [selectedNode]);

  const addNode = useCallback(() => {
      setNodes((currentNodes) => {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const newNode = {
          id: (currentNodes.length + 1).toString(),
          type: 'genericNode',
          dragHandle: '.drag-handle',
          position: project({ x: mousePosition.x - left - 150, y: mousePosition.y - top - 75 }),
          data: {
            functions: ['modifyText'],
            title: '',
            subtitle: '',
            description: '',
            modifyText
          },
        };
        return currentNodes.concat(newNode);
      });
    }, [setNodes, mousePosition, project, modifyText])


  // add event listeners
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'f' && event.ctrlKey) {  
        console.log(mousePosition)
        addNode();
      }
    }
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }

    const handleMouseDown = (event) => {
      switch(event.button) {
        case 3:
          setDiagramName(null);
          moveDiagramFromBackwardsHistoryToForwardsHistory();
          break;
        case 4:
          setDiagramName(null);
          moveDiagramFromForwardsHistoryToBackwardsHistory();
          break;
        default:
          break;
      }
    }
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
    }
  }, [mousePosition, setMousePosition, addNode, moveDiagramFromBackwardsHistoryToForwardsHistory, moveDiagramFromForwardsHistoryToBackwardsHistory]);

  return (
    <div style={{ width: '95vw', height: '95vh' }} ref={reactFlowWrapper}>
      <Toolbar createNewDiagram={createNewDiagram} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        snapGrid={[30, 30]}
        snapToGrid={true}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
      >
        <Background color="#aaa" gap={30} />
      </ReactFlow>
      <input type="text" className="diagram-input diagram-name" placeholder='Enter diagram name here...' value={diagramName || savedDiagramName} onKeyDown={handleDiagramNameChange} onChange={(e) => setDiagramName(e.target.value)} />
      <input type="text" className="diagram-input diagram-description" placeholder='Enter diagram description here...' value={diagramDescription} onChange={(e) => setDiagramDescription(e.target.value)} />
      <div className='diagram-last-updated-date'>{diagramLastUpdated}</div>
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);
