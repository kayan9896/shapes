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
      if (lineRef.current && !lineRef.current.contains(e.target) && !activeDot) {
        setShowDots(false);
        setLineClicked(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDot]);

  const handleLineClick = (e) => {
    e.stopPropagation();
    setShowDots(true);
    setLineClicked(true);
  };

  const handleDotMouseDown = (e, dotType) => {
    e.stopPropagation();
    setActiveDot(dotType);
    setIsMouseDown(true);
  };

  const handleMouseDown = (e) => {
    if (lineClicked && !activeDot) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragLine({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        originalCenter: { ...center },
        originalRandom: { ...randomPoint }
      });
      setIsMouseDown(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeDot === 'center') {
      setCenter({ x, y });
    } else if (activeDot === 'random') {
      setRandomPoint({ x, y });
    } else if (dragLine) {
      const dx = x - dragLine.startX;
      const dy = y - dragLine.startY;
      
      setCenter({ 
        x: dragLine.originalCenter.x + dx, 
        y: dragLine.originalCenter.y + dy 
      });
      setRandomPoint({ 
        x: dragLine.originalRandom.x + dx, 
        y: dragLine.originalRandom.y + dy 
      });
    }
  };

  const handleMouseUp = () => {
    setActiveDot(null);
    setDragLine(false);
    setIsMouseDown(false);
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
        <line
          ref={lineRef}
          x1={center.x}
          y1={center.y}
          x2={randomPoint.x}
          y2={randomPoint.y}
          stroke="red"
          strokeWidth="2"
          style={{ pointerEvents: 'auto', cursor: 'move' }}
          onClick={handleLineClick}
        />
      </svg>

      {/* Center dot */}
      <div
        style={{
          ...dotStyle(activeDot === 'center'),
          left: `${center.x - (activeDot === 'center' ? 10 : 5)}px`,
          top: `${center.y - (activeDot === 'center' ? 10 : 5)}px`,
        }}
        onMouseDown={(e) => handleDotMouseDown(e, 'center')}
      />

      {/* Random point dot */}
      <div
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