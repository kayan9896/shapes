import React, { useState, useRef, useEffect } from 'react';

const App = () => {
  const squareSize = 400;
  const [center, setCenter] = useState({ x: squareSize / 2, y: squareSize / 2 });
  const [randomPoint, setRandomPoint] = useState({
    x: Math.random() * squareSize,
    y: Math.random() * squareSize
  });
  const [showDots, setShowDots] = useState(false);
  const [activeDot, setActiveDot] = useState(null);
  const [dragLine, setDragLine] = useState(false);
  const [lineClicked, setLineClicked] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lineRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const rect = lineRef.current.parentElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      if (!isPointNearLine(mouseX, mouseY, center.x, center.y, randomPoint.x, randomPoint.y) &&
          !e.target.classList.contains('draggable-dot')) {
        setShowDots(false);
        setLineClicked(false);
      }
    };
  
    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, [center, randomPoint]);
  

  const handleDotMouseDown = (e, dotType) => {
  e.preventDefault(); // Prevent text selection
  e.stopPropagation();
  setActiveDot(dotType);
  setIsMouseDown(true);
};

// Update the useEffect for global mouse events
useEffect(() => {
  const handleGlobalMouseMove = (e) => {
    if (!isMouseDown) return;

    const rect = lineRef.current.parentElement.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), squareSize);
    const y = Math.min(Math.max(0, e.clientY - rect.top), squareSize);

    if (activeDot === 'center') {
      setCenter({ x, y });
    } else if (activeDot === 'random') {
      setRandomPoint({ x, y });
    } else if (dragLine) {
      const dx = x - dragLine.startX;
      const dy = y - dragLine.startY;
      
      setCenter({ 
        x: Math.min(Math.max(0, dragLine.originalCenter.x + dx), squareSize),
        y: Math.min(Math.max(0, dragLine.originalCenter.y + dy), squareSize)
      });
      setRandomPoint({ 
        x: Math.min(Math.max(0, dragLine.originalRandom.x + dx), squareSize),
        y: Math.min(Math.max(0, dragLine.originalRandom.y + dy), squareSize)
      });
    }
  };

  const handleGlobalMouseUp = () => {
    setActiveDot(null);
    setDragLine(false);
    setIsMouseDown(false);
 
  };

  window.addEventListener('mousemove', handleGlobalMouseMove);
  window.addEventListener('mouseup', handleGlobalMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
  };
}, [isMouseDown, activeDot, dragLine, squareSize]);


  const handleLineClick = (e) => {
    e.stopPropagation();
    setShowDots(true);
    setLineClicked(true);
  };
  
  const HIT_TOLERANCE = 5;

  // Helper function to check if a point is near the line
  const isPointNearLine = (px, py, x1, y1, x2, y2) => {
    const lineLength = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    if (lineLength === 0) return false;
    
    const t = ((px-x1) * (x2-x1) + (py-y1) * (y2-y1)) / (lineLength**2);
    
    if (t < 0) return Math.sqrt((px-x1)**2 + (py-y1)**2) <= HIT_TOLERANCE;
    if (t > 1) return Math.sqrt((px-x2)**2 + (py-y2)**2) <= HIT_TOLERANCE;
    
    const nearestX = x1 + t * (x2-x1);
    const nearestY = y1 + t * (y2-y1);
    return Math.sqrt((px-nearestX)**2 + (py-nearestY)**2) <= HIT_TOLERANCE;
  };

  // Modify handleMouseDown
  const handleMouseDown = (e) => {
    if (lineClicked && !activeDot) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if click is near the line
      if (isPointNearLine(mouseX, mouseY, center.x, center.y, randomPoint.x, randomPoint.y)) {
        e.preventDefault();
        setDragLine({
          startX: mouseX,
          startY: mouseY,
          originalCenter: { ...center },
          originalRandom: { ...randomPoint }
        });
        setIsMouseDown(true);
      }
    }
  };


  const dotStyle = (active) => ({
    width: active ? '20px' : '10px',
    height: active ? '20px' : '10px',
    backgroundColor: active ? 'transparent' : 'red',
    border: '2px solid red',
    borderRadius: '50%',
    position: 'absolute',
    cursor: 'move',
    display: showDots ? 'block' : 'none'
  });
  

  return (
    <div 
      style={{ 
        width: `${squareSize}px`, 
        height: `${squareSize}px`, 
        border: '1px solid black', 
        position: 'relative' 
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Image placeholder */}
      <img 
        src="path-to-your-image.jpg" 
        alt="Square content" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Line */}
      <svg 
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        width={squareSize} 
        height={squareSize}
      >
        {/* Invisible wider line for hit detection */}
        <line
          x1={center.x}
          y1={center.y}
          x2={randomPoint.x}
          y2={randomPoint.y}
          stroke="transparent"
          strokeWidth={HIT_TOLERANCE * 2}
          style={{ pointerEvents: 'all', cursor: 'pointer' }}
          onClick={handleLineClick}
          onMouseDown={handleMouseDown}
        />
        {/* Visible line */}
        <line
          ref={lineRef}
          x1={center.x}
          y1={center.y}
          x2={randomPoint.x}
          y2={randomPoint.y}
          stroke="red"
          strokeWidth="2"
          style={{ pointerEvents: 'none' }}
        />
      </svg>

      {/* Center dot */}
      <div
        className="draggable-dot" // Add this class
        style={{
          ...dotStyle(activeDot === 'center'),
          left: `${center.x - 2-(activeDot === 'center' ? 10 : 5)}px`,
          top: `${center.y - 2-(activeDot === 'center' ? 10 : 5)}px`,
        }}
        onMouseDown={(e) => handleDotMouseDown(e, 'center')}
      />

      <div
        className="draggable-dot" // Add this class
        style={{
          ...dotStyle(activeDot === 'random'),
          left: `${randomPoint.x - (activeDot === 'random' ? 10 : 5)}px`,
          top: `${randomPoint.y - (activeDot === 'random' ? 10 : 5)}px`,
        }}
        onMouseDown={(e) => handleDotMouseDown(e, 'random')}
      />
    </div>
  );
};

export default App;
