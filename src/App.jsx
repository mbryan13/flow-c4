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

  const [prevDiagramName, setPrevDiagramName] = React.useState('');
  const [diagramName, setDiagramName] = React.useState('Banking System');
  const [diagramLastUpdated, setDiagramLastUpdated] = React.useState('');
  const [diagramDescription, setDiagramDescription] = React.useState('');
  const [diagramHistory, setDiagramHistory] = React.useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [lineType, setLineType] = React.useState('straight');
  const [selectedNode, setSelectedNode] = React.useState();

  const onConnect = React.useCallback((params) => setEdges((eds) => {
    console.log(params, eds)
    return addEdge({...params, type: lineType,  animated: true, markerStart: { type: MarkerType.ArrowClosed, color: 'black' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'black' },
  }, eds)
  }), [setEdges]);

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
    // push to diagram history
    setDiagramHistory(diagramHistory.concat(diagramName));
    setDiagramName('New Diagram');
    setPrevDiagramName(' ');
  })

  React.useEffect(() => {
    console.log(diagramHistory, diagramName)
  }, [diagramHistory])

  const onEdgeClick = React.useCallback((event, edge) => {
    if(!event.ctrlKey) return;
    const newEdges = edges.filter((e) => e.id !== edge.id);
    setEdges(newEdges);
  }, [edges, setEdges]);

  // React.useEffect(() => {
  //   for (const key in localStorage) {
  //     console.log(key);
  //     if(key !== diagramName) localStorage.removeItem(key);
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
    console.log('saving diagram')
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
    instanceObject.lastUpdated = lastUpdated;
    setDiagramLastUpdated(lastUpdated);
    console.log(diagramDescription)
    instanceObject.diagramName = diagramName;
    instanceObject.diagramDescription = diagramDescription;
    localStorage.setItem(diagramName, JSON.stringify(instanceObject));
  }, [reactFlowInstance]);

  const nodeFunctions = {
    modifyText
  }

  const handleDiagramNameChange = React.useCallback((event) => {
    if(event.key !== 'Enter') return setDiagramName(event.target.value);
    console.log(localStorage)
    if(prevDiagramName === '') localStorage.removeItem(diagramName);
    else if(prevDiagramName !== diagramName && localStorage.hasOwnProperty(prevDiagramName)) localStorage.removeItem(prevDiagramName);
    setPrevDiagramName(diagramName);
    saveDiagram(diagramName, diagramDescription);
  }, [setDiagramName, diagramName, diagramDescription, saveDiagram, prevDiagramName, setPrevDiagramName]);


  React.useEffect(() => {
    console.log('loading diagram: ', diagramName);
    const diagram = localStorage.getItem(diagramName);
    if(!diagram) return;
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
  }, [diagramName]);

  React.useEffect(() => {
    const intervalID = setInterval(() => saveDiagram(diagramName, diagramDescription), 5000); 
    return () => {
      clearInterval(intervalID);
    }
  }, [saveDiagram, diagramName, diagramDescription]);

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
            modifyText
          },
        };
        return currentNodes.concat(newNode);
      });
    }, [setNodes, mousePosition, project, modifyText])


  // add event listeners for f keypress
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
          if(diagramHistory.length === 0) return;
          setDiagramHistory(diagramHistory.slice(0, diagramHistory.length - 1));
          setDiagramName(diagramHistory[diagramHistory.length - 1]);
          break;
        case 4:
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
  }, [mousePosition, setMousePosition, addNode]);

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
      <input type="text" className="diagram-input diagram-name" placeholder='Enter diagram name here...' value={diagramName} onKeyDown={handleDiagramNameChange} onChange={(e) => setDiagramName(e.target.value)} />
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
