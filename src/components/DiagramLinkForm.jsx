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

  const styles = {
    root: {
      position: 'absolute',
      zIndex: '100',
      top: formLocation.top,
      left: formLocation.left,
      display: 'flex',
      gap: '2px',
      backgroundColor: 'rgba(37, 37, 37, .9)',
      padding: '5px',
      borderRadius: '2px',
      border: '1px solid grey'
    }
  }
  return (
    <form onSubmit={handleSubmit} style={styles.root}>
      <input ref={inputRef} placeholder='Enter diagram name to link...' type="text" name="diagramName" id="diagramName" />
      <button type="submit">Link</button>
      <button onClick={closeForm}>Cancel</button>
    </form>
  )
}

export default DiagramLinkForm