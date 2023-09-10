import { useCallback, useState, createRef, useEffect } from 'react';
import { CiLink } from 'react-icons/ci';
import { Handle } from 'reactflow';

const handlePositions = [
  [0,10], [10,0], [0, 95], [0, 75], [10, 180], [0, 170],  // left side
  [140,180], [160, 180], [300, 170], [290, 180], // bottom side
  [300, 75], [300, 95], [290, 0], [300, 10], // right side 
  [160, 0], [140, 0] // top side 
]

function GenericNode({ data, isConnectable, id }) {
  const { isHovered: nodeIsHovered, modifyText, openDiagram, title, subtitle, description, link } = data;
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
      const topNudge = -10;
      const leftNudge = 0;
      const style = {
        top: `${position[1] + topNudge}px`,
        left: `${position[0] + leftNudge}px`,
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
      {data.link && <div onClick={() => openDiagram(link)} className='diagram-link'><CiLink/></div>}
      <input type="text" className="nodrag generic-input input-title" value={title} onChange={(e) => modifyText(e, 'title', id)} />
      <input type="text" className="nodrag generic-input input-subtitle" value={subtitle} onChange={(e) => modifyText(e, 'subtitle', id)} />
      <textarea type="text" className="nodrag generic-input input-description" value={description} onChange={(e) => modifyText(e, 'description', id)} />
      {renderHandles()}
    </div>
  );
}

export default GenericNode;
