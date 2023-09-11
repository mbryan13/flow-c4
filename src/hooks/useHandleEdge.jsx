import { useCallback } from "react";

function useHandleEdge (setEdges, setPendingDiagramChanges, addEdge, markers) {
  const onEdgeClick = useCallback((event, edge) => {
    setPendingDiagramChanges(true);
    if(!event.ctrlKey) {
      return setEdges(prevEdges => {
        const newEdges = prevEdges.map((e) => {
          if(e.id === edge.id) {
            if(!e.label) {
              return {
                ...e,
                label: ' '
              }
            }
          }
          return e;
        });
        return newEdges;
      });
    }
    return setEdges(prevEdges => {
      const newEdges = prevEdges.filter((e) => e.id !== edge.id);
      return newEdges;
    });
  }, [setEdges, setPendingDiagramChanges]);

  const updateEdgeLabel = useCallback((newLabel, edgeID, labelHeight) => {
    setEdges((currentEdges) => {
      const newEdges = currentEdges.map((edge) => {
        if(edge.id !== edgeID) return edge;
        return {
          ...edge,
          label: newLabel,
          data: {
            ...edge.data,
            labelHeight
          }
        }
      });
      return newEdges;
    });
    setPendingDiagramChanges(true);
  }, [setEdges, setPendingDiagramChanges]);

  const onConnect = useCallback((params) => setEdges((eds) => {
    return addEdge({...params, type: 'custom', data: { functions: ['updateEdgeLabel'], updateEdgeLabel }, animated: markers.isAnimated, markerStart: { type: markers.start.type, color: markers.start.color }, markerEnd: { type: markers.end.type, color: markers.end.color },
  }, eds)
  }), [setEdges, markers, updateEdgeLabel, addEdge]);
  return {
    onEdgeClick,
    updateEdgeLabel,
    onConnect
  }
}

export default useHandleEdge;