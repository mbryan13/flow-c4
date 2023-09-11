import { useState, useCallback, useRef, useEffect } from 'react';
import GenericNode from '../nodes/GenericNode';
import CustomEdge from '../edges/CustomEdge';
import ReactFlow, { useNodesState, useEdgesState, addEdge, useReactFlow, ReactFlowProvider, MarkerType, Background } from 'reactflow';
import ContextMenu from './ContextMenu.jsx';
import DiagramLinkForm from './DiagramLinkForm';
import ColorPaletteMenu from './ColorPaletteMenu';
import { MdPending } from 'react-icons/md';
import { AiFillCheckCircle } from 'react-icons/ai';
import useHandleNode from '../hooks/useHandleNode';
import useHandleEdge from '../hooks/useHandleEdge';
import axios from 'axios';

const nodeTypes = {
  genericNode: GenericNode,
};

const edgeTypes = {
  custom: CustomEdge,
}

const Diagram = (props) => {
  const { savedDiagramName, saveDiagram, createNewDiagram, openDiagram, pendingDiagramChanges, setPendingDiagramChanges } = props;
  const [menu, setMenu] = useState(null);
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const { project, setViewport } = reactFlowInstance;

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [diagramName, setDiagramName] = useState(null);
  const [diagramDescription, setDiagramDescription] = useState('');
  const [diagramLastUpdated, setDiagramLastUpdated] = useState('');
  const [diagramLink, setDiagramLink] = useState(null);
  const [shouldSaveDiagram, setShouldSaveDiagram] = useState(false);
  const [colorPaletteMenu, setColorPaletteMenu] = useState(null);
  
  const [markers, setMarkers] = useState({
    start: { type: null, color: 'black' },
    end: { type: MarkerType.ArrowClosed, color: 'black' },
    isAnimated: true
  });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [lineType, setLineType] = useState('straight');
  const [selectedNode, setSelectedNode] = useState();
  const { modifyText, addNode, onNodeClick, onNodeMouseEnter, onNodeMouseLeave, onNodeContextMenu } = useHandleNode(nodes, edges, setEdges, setSelectedNode, setNodes, reactFlowWrapper, mousePosition, project, openDiagram, setPendingDiagramChanges, setMenu);
  const { onEdgeClick, updateEdgeLabel, onConnect } = useHandleEdge(setEdges, setPendingDiagramChanges, addEdge, markers);

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const getDiagramState = useCallback(() => {
    const instanceObject = reactFlowInstance.toObject();
    const lastUpdated = formatDate(new Date());
    return { instanceObject, lastUpdated, diagramName, diagramDescription };
  }, [reactFlowInstance, diagramName, diagramDescription]);
  
  const handleSaveDiagram = useCallback(() => {
    const { instanceObject, lastUpdated, diagramName, diagramDescription } = getDiagramState();
    setDiagramLastUpdated(lastUpdated);
    saveDiagram(diagramName, diagramDescription, instanceObject, lastUpdated);
  }, [saveDiagram, getDiagramState]);

  const handleDiagramNameChange = useCallback((event) => {
    if(event.key !== 'Enter') return setDiagramName(event.target.value);
    setShouldSaveDiagram(true);
  }, [setDiagramName, setShouldSaveDiagram]);

  const linkDiagram = useCallback((type, id, linkedDiagramName) => {
    // update node with linked diagram name
    const addNodeLink = (id, linkedDiagramName) => {
      setNodes((currentNodes) => {
        const newNodes = currentNodes.map((node) => {
          if(node.id !== id) return node;
          console.log('adding link to node: ', node, linkedDiagramName)
          return {
            ...node,
            data: {
              ...node.data,
              link: linkedDiagramName
            }
          }
        });
        console.log('new nodes: ', newNodes[0])
        return newNodes;
      });
    }
    const addEdgeLink = (id, linkedDiagramName) => {
      setEdges((currentEdges) => {
        const newEdges = currentEdges.map((edge) => {
          if(edge.id !== id) return edge;
          return {
            ...edge,
            data: {
              ...edge.data,
              link: linkedDiagramName
            }
          }
        });
        return newEdges;
      });
    }
    if(type === 'node') addNodeLink(id, linkedDiagramName);
    if(type === 'edge') addEdgeLink(id, linkedDiagramName);
    setShouldSaveDiagram(true);
  }, [setNodes, setEdges, setShouldSaveDiagram]);

  const changeColor = useCallback((id, type, color) => {
    const changeNodeColor = (id, color) => {
      setNodes((currentNodes) => {
        const newNodes = currentNodes.map((node) => {
          if(node.id !== id) return node;
          return {
            ...node,
            data: {
              ...node.data,
              color
            }
          }
        });
        return newNodes;
      });
    }
    const changeEdgeColor = (id, color) => {
      setEdges((currentEdges) => {
        const newEdges = currentEdges.map((edge) => {
          if(edge.id !== id) return edge;
          return {
            ...edge,
            data: {
              ...edge.data,
              color
            }
          }
        });
        return newEdges;
      });
    }
    if(type === 'node') changeNodeColor(id, color);
    if(type === 'edge') changeEdgeColor(id, color);
    setShouldSaveDiagram(true);
  }, [setNodes, setEdges, setShouldSaveDiagram]);

  // save diagram to local storage
  useEffect(() => {
    console.log('should save diagram: ', shouldSaveDiagram)
    if(!shouldSaveDiagram) return;
    handleSaveDiagram();
    setShouldSaveDiagram(false);
  }, [shouldSaveDiagram, handleSaveDiagram]);

  // load diagram from local storage
  useEffect(() => {
    if(!savedDiagramName) return;
    const addFunctions = (parsedDiagram) => {
      const nodeFunctions = {
        modifyText,
        openDiagram
      };
      const edgeFunctions = {
        updateEdgeLabel
      };
      parsedDiagram.nodes.forEach((node) => {
        node.data?.functions?.forEach((funcName) => {
          node.data[funcName] = nodeFunctions[funcName];
        });
      });
      parsedDiagram.edges.forEach((edge) => {
        edge.data?.functions?.forEach((funcName) => {
          edge.data[funcName] = edgeFunctions[funcName];
        });
      });
    }
    const getOrCreateDiagram = async (savedDiagramName) => {
      let response = await axios.get(`http://localhost:${window.WS_PORT}/flowChart/${savedDiagramName}`);
      let diagram = response.data;
      if(!diagram) {
        const instanceObject = {
          nodes: [],
          edges: [],
          viewport: {
            x: 0,
            y: 0,
            zoom: 1
          },
        }
        diagram = instanceObject;
      }
      return diagram;
    };
    const loadDiagram = async (savedDiagramName) => {
      const diagram = await getOrCreateDiagram(savedDiagramName);
      addFunctions(diagram);

      setNodes(diagram.nodes)
      setEdges(diagram.edges)
      setDiagramDescription(diagram.diagramDescription || '');
      setDiagramName(savedDiagramName);
      setDiagramLastUpdated(diagram.lastUpdated);
      setViewport(diagram.viewport);
    }
    loadDiagram(savedDiagramName);
  
  }, [savedDiagramName, setEdges, setNodes, setViewport, modifyText, openDiagram, updateEdgeLabel]); 

  // update which node is being hovered over
  useEffect(() => {
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
  }, [selectedNode, setNodes]);

  // add event listeners
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'f' && event.ctrlKey) {  
        addNode();
      }
      if (event.key === 's' && event.ctrlKey) {
        setShouldSaveDiagram(true);
      }
    }
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [setMousePosition, addNode, handleSaveDiagram]);
      
  if(!savedDiagramName) return (
    <div>
      <button onClick={createNewDiagram}>Create New Diagram</button>
      <button onClick={() => openDiagram('test')}>Open Diagram</button>
    </div>
  )
  return (
    <div style={{ width: '100vw', height: '100vh' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        snapGrid={[30, 30]}
        snapToGrid={true}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
      >
        <Background color="#aaa" gap={30} />
        { menu && 
          <ContextMenu {...menu} 
            onClick={onPaneClick} 
            setDiagramLink={setDiagramLink} 
            setColorPaletteMenu={setColorPaletteMenu}
          />
        }
        { diagramLink && 
          <DiagramLinkForm 
            closeForm={() => setDiagramLink(null)} 
            linkDiagram={linkDiagram} 
            type={diagramLink.type} 
            id={diagramLink.id} 
            mouseX={mousePosition.x} 
            mouseY={mousePosition.y} 
          />
        }
        { colorPaletteMenu &&
          <ColorPaletteMenu
            id={colorPaletteMenu.id}
            type={colorPaletteMenu.type}
            setColorPaletteMenu={setColorPaletteMenu}
            mouseX={mousePosition.x}
            mouseY={mousePosition.y}
            changeColor={changeColor}
          />
        }
      </ReactFlow>
      <input type="text" className="diagram-input diagram-name" placeholder='Enter diagram name here...' value={diagramName || savedDiagramName} onKeyDown={handleDiagramNameChange} onChange={(e) => setDiagramName(e.target.value)} />
      <input type="text" className="diagram-input diagram-description" placeholder='Enter diagram description here...' value={diagramDescription} onChange={(e) => setDiagramDescription(e.target.value)} />
      <div className='diagram-last-updated-container'>
        {pendingDiagramChanges ? <MdPending className='pending-icon'/> : <AiFillCheckCircle className='check-icon'/>}
        {diagramLastUpdated || 'No save history'}
      </div>
    </div>  
  )
}

export default (props) => (
  <ReactFlowProvider>
    <Diagram {...props} />
  </ReactFlowProvider>
)

function formatDate(date) {
  // ex. Wednesday, March 22 at 4:30 PM PST
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
  return `${day}, ${month} ${dayOfMonth} at ${formattedHour}:${formattedMinute} ${ampm} PST`;
}
