import {useEffect, useState, useRef} from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath
} from "reactflow";

import "../index.css";

export default function CustomEdge(props) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, label, data } = props;
  const { updateEdgeLabel, labelHeight } = data;
  const [edgeLabel, setEdgeLabel] = useState('');
  const textAreaRef = useRef(null);
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

  useEffect(() => {
    setEdgeLabel(label);
  }, [label])

  useEffect(() => {
    if(textAreaRef.current) {
      if(label.length <= 20) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.width = label.length * 8 + 'px';
      }
      else textAreaRef.current.style.height = labelHeight;
    }
  }, [labelHeight])

  const resizeTextArea = () => {
    if (textAreaRef.current) {
      console.log('resizing text area')
      const labelLength = textAreaRef.current.value.length;
      if(labelLength <= 20) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.width = labelLength * 8 + 'px';
      }
      else {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight - 15}px`;
      }
    }
  };

  const handleChange = (e) => {
    setEdgeLabel((e.target.value).trimStart());
    resizeTextArea();
  };

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
            {label && <textarea
              className="edgelabel"
              rows={1}
              ref={textAreaRef}
              value={edgeLabel}
              onChange={handleChange}
              onBlur={() => updateEdgeLabel(edgeLabel, id, textAreaRef.current.style.height)}
            />}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
