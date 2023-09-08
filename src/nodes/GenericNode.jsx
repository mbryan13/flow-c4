import { useCallback, useState, createRef, useEffect } from 'react';
import { Handle } from 'reactflow';

const handlePositions = [
  [10,0], [0,5], [0, 45], [0, 55], [0, 95], [10, 100],
  [42,100], [57, 100], [57, 0], [42, 0],
  [90, 0], [100, 5], [100, 55], [100, 45], [100, 95], [90, 100], 
]

function GenericNode({ data, isConnectable, id }) {
  const { isHovered: nodeIsHovered, modifyText, title, subtitle, description } = data;
  const [handleRefs, setHandleRefs] = useState({
    a: createRef(),
    b: createRef(),
    c: createRef(),
    d: createRef(),
    e: createRef(),
    f: createRef(),
    g: createRef(),
    h: createRef(),
    i: createRef(),
    j: createRef(),
    k: createRef(),
    l: createRef(),
    m: createRef(),
    n: createRef(),
    o: createRef(),
    p: createRef()
  });

  const onHandleEnter = useCallback((handleId) => {
    handleRefs[handleId].current.style.opacity = 1;
  }, []);

  const onHandleLeave = useCallback((handleId) => {
    handleRefs[handleId].current.style.opacity = nodeIsHovered ? 1 : 0.2;
  }, []);

  const onHandleClick = useCallback((handleId) => {
  }, []);

  useEffect(() => {
    Object.keys(handleRefs).forEach((key) => {
      handleRefs[key].current.style.opacity = nodeIsHovered ? 0.2 : 0;
    })
  }, [nodeIsHovered]);

  const renderHandles = useCallback(() => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const handles = handlePositions.map((position, index) => {
      const handleRef = handleRefs[alphabet[index]];
      const handleType = index % 2 === 0 ? 'source' : 'target';
      const topNudge = -5;
      const leftNudge = 0;
      const style = {
        top: `${position[0] + topNudge}%`,
        left: `${position[1] + leftNudge}%`,
        backgroundColor: handleType === 'target' ? 'red' : 'green',
        width: '20px',
        height: '20px'
      }
      return (
        <Handle 
          type={handleType}
          style={style} 
          isConnectable={isConnectable} 
          id={alphabet[index]} 
          key={index} 
          ref={handleRef}
          onMouseEnter={() => onHandleEnter(alphabet[index])}
          onMouseLeave={() => onHandleLeave(alphabet[index])}
          onClick={() => onHandleClick(alphabet[index])}
        />
      )
    })
    return handles;
  }, [])

  return (
    <div className="text-updater-node" >
      <div className='drag-handle'></div>
      <input type="text" className="nodrag generic-input input-title" value={title} onChange={(e) => modifyText(e, 'title', id)} />
      <input type="text" className="nodrag generic-input input-subtitle" value={subtitle} onChange={(e) => modifyText(e, 'subtitle', id)} />
      <textarea type="text" className="nodrag generic-input input-description" value={description} onChange={(e) => modifyText(e, 'description', id)} />
      {renderHandles()}
    </div>
  );
}

export default GenericNode;
