import { useState, useRef, useEffect } from 'react'

const DiagramLinkForm = (props) => {
  const { closeForm, linkDiagram, type, id, mouseX, mouseY } = props;
  const [formLocation] = useState({ top: mouseY, left: mouseX });
  
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const diagramName = e.target.diagramName.value;
    linkDiagram(type, id, diagramName);
    closeForm();
  }
  return (
    <form onSubmit={handleSubmit} style={{ position: 'absolute', zIndex: '100', top: formLocation.top, left: formLocation.left }}>
      <input ref={inputRef} placeholder='Enter name of diagram to link...' type="text" name="diagramName" id="diagramName" />
      <button type="submit">Link</button>
      <button onClick={closeForm}>Cancel</button>
    </form>
  )
}

export default DiagramLinkForm