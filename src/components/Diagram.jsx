import { useState, useCallback, useRef, useEffect } from 'react';
import GenericNode from '../nodes/GenericNode';
import CustomEdge from '../edges/CustomEdge';
import ReactFlow, { useNodesState, useEdgesState, addEdge, useReactFlow, ReactFlowProvider, MarkerType, Background } from 'reactflow';

const nodeTypes = {
  genericNode: GenericNode,
};

const edgeTypes = {
  custom: CustomEdge,
}

const Diagram = (props) => {
  const { savedDiagramName, saveDiagram, createNewDiagram, openDiagram } = props;
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const { project, setViewport } = reactFlowInstance;

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [diagramName, setDiagramName] = useState(null);
  const [diagramDescription, setDiagramDescription] = useState('');
  const [diagramLastUpdated, setDiagramLastUpdated] = useState('');

  const [markers, setMarkers] = useState({
    start: { type: null, color: 'black' },
    end: { type: MarkerType.ArrowClosed, color: 'black' },
    isAnimated: true
  });


  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [lineType, setLineType] = useState('straight');
  const [selectedNode, setSelectedNode] = useState();

  const onConnect = useCallback((params) => setEdges((eds) => {
    console.log(params, eds)
    return addEdge({...params, type: 'custom',  label: 'hello are you working', animated: markers.isAnimated, markerStart: { type: markers.start.type, color: markers.start.color }, markerEnd: { type: markers.end.type, color: markers.end.color },
  }, eds)
  }), [setEdges]);

  const handleDiagramNameChange = useCallback((event) => {
    if(event.key !== 'Enter') return setDiagramName(event.target.value);
    console.log(localStorage)
    const instanceObject = reactFlowInstance.toObject();
    saveDiagram(diagramName, diagramDescription, instanceObject);
  }, [reactFlowInstance, setDiagramName, diagramName, diagramDescription, saveDiagram]);

  const modifyText = useCallback((event, textType, nodeID) => {
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
  }, [setNodes]);

  const onEdgeClick = useCallback((event, edge) => {
    if(!event.ctrlKey) {
      console.log(edge);
      const newEdges = edges.map((e) => {
        if(e.id === edge.id) {
          e.label = 'hello well this sort of works but not really not very user friendly';
        }
        return e;
      });
      return setEdges(newEdges);
    }
    const newEdges = edges.filter((e) => e.id !== edge.id);
    setEdges(newEdges);
  }, [edges, setEdges]);

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


  const onNodeClick = useCallback((event, node) => {
    if(!event.ctrlKey || !event.shiftKey) return;
    const newNodes = nodes.filter((n) => n.id !== node.id);
    setNodes(newNodes);
    const newEdges = edges.filter((e) => e.source !== node.id && e.target !== node.id);
    setEdges(newEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const onNodeMouseEnter = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setSelectedNode({id: '-1'});
  }, []);

  // load diagram from local storage
  useEffect(() => {
    const nodeFunctions = {
      modifyText
    };
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
    setDiagramDescription(parsedDiagram.diagramDescription || '');
    setDiagramName(savedDiagramName);
    setDiagramLastUpdated(parsedDiagram.lastUpdated);
  
  }, [savedDiagramName, setEdges, setNodes, setViewport, modifyText]); 

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
  }, [selectedNode]);

    // add event listeners
    useEffect(() => {
      const handleKeyPress = (event) => {
        if (event.key === 'f' && event.ctrlKey) {  
          console.log(mousePosition)
          addNode();
        }
        if (event.key === 's' && event.ctrlKey) {
          console.log('saving diagram')
          const instanceObject = reactFlowInstance.toObject();
          saveDiagram(diagramName, diagramDescription, instanceObject);
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
    }, [mousePosition, setMousePosition, addNode, reactFlowInstance, saveDiagram, diagramName, diagramDescription]);

  if(!savedDiagramName) return (
    <div>
      <button onClick={createNewDiagram}>Create New Diagram</button>
      <button onClick={() => openDiagram('test')}>Open Diagram</button>
    </div>
  )
  return (
    <div style={{ width: '95vw', height: '95vh' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        snapGrid={[30, 30]}
        // snapToGrid={true}
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
  )
}

export default (props) => (
  <ReactFlowProvider>
    <Diagram {...props} />
  </ReactFlowProvider>
)