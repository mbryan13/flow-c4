import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath
} from "reactflow";

import "../index.css";

const onEdgeClick = (evt, id) => {
  evt.stopPropagation();
  alert(`remove ${id}`);
};

export default function CustomEdge(props) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = props;
  const targetHandle = id.split('-')[2][1];

  let nudgeY = 0;
  let nudgeX = 0;
  if(targetHandle === 'h') nudgeY = 10;
  if(targetHandle === 'j') {
    nudgeY = 12;
    nudgeX = 5
  }
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sourceX,
    sourceY: sourceY,
    sourcePosition: sourcePosition,
    targetX: targetX + nudgeX,
    targetY: targetY + nudgeY,
    targetPosition
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: "all"
          }}
          className="nodrag nopan"
        >
          <button
            className="edgebutton"
            onClick={(event) => onEdgeClick(event, id)}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
