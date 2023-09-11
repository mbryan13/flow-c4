import { useState, useCallback } from 'react';

function useHandleNode (nodes, edges, setEdges, setSelectedNode, setNodes, reactFlowWrapper, mousePosition, project, openDiagram, setPendingDiagramChanges, setMenu) {

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

  const addNode = useCallback(() => {
    setNodes((currentNodes) => {
      const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
      const newNode = {
        id: (currentNodes.length + 1).toString(),
        type: 'genericNode',
        dragHandle: '.drag-handle',
        position: project({ x: mousePosition.x - left - 150, y: mousePosition.y - top - 75 }),
        data: {
          functions: ['modifyText', 'openDiagram'],
          title: '',
          subtitle: '',
          description: '',
          modifyText,
          openDiagram
        },
      };
      return currentNodes.concat(newNode);
    });
    setPendingDiagramChanges(true);
  }, [setNodes, mousePosition, project, modifyText, openDiagram, setPendingDiagramChanges, reactFlowWrapper]);

  const onNodeClick = useCallback((event, node) => {
    if(!event.ctrlKey || !event.shiftKey) return;
    const newNodes = nodes.filter((n) => n.id !== node.id);
    setNodes(newNodes);
    const newEdges = edges.filter((e) => e.source !== node.id && e.target !== node.id);
    setEdges(newEdges);
    setPendingDiagramChanges(true);
  }, [nodes, edges, setNodes, setEdges, setPendingDiagramChanges]);

  const onNodeMouseEnter = useCallback((event, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onNodeMouseLeave = useCallback(() => {
    setSelectedNode({id: '-1'});
  }, [setSelectedNode]);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = reactFlowWrapper.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom: event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu]
  );
  return {
    modifyText,
    addNode,
    onNodeClick,
    onNodeMouseEnter,
    onNodeMouseLeave,
    onNodeContextMenu
  }
}

export default useHandleNode;