import { useState } from 'react';

const ColorPaletteMenu = ({ id, type, setColorPaletteMenu, mouseX, mouseY, changeColor }) => {
  const [formLocation] = useState({ top: mouseY, left: mouseX });

  const handleClick = (e) => {
    const color = e.target.style.backgroundColor;
    changeColor(id, type, color);
    setColorPaletteMenu(false);
  };
  const styles = {
    root: {
      position: 'absolute',
      zIndex: '100',
      top: formLocation.top,
      left: formLocation.left,
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '3px',
      backgroundColor: 'rgba(37, 37, 37, .9)',
      padding: '5px',
      borderRadius: '2px',
      border: '1px solid grey'
    },
    colorBox: {
      width: '20px',
      height: '20px',
      borderRadius: '2px',
      cursor: 'pointer',
      border: '1px solid grey'
    }
  }
  return (
    <div style={styles.root}>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'red' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'orange' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'rgb(0,100,10)' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'rgb(0, 0, 100)' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'rgb(71, 71, 255)' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'purple' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'pink' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'black' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'grey' }}></div>
      <div onClick={handleClick} style={{ ...styles.colorBox, backgroundColor: 'brown' }}></div>
    </div>
  ) 
}

export default ColorPaletteMenu;