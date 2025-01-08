import React, { useState, useRef, useEffect } from 'react';
import Circle from './Circle';

const App = () => {
  const squareSize = 400;
  const [showDots, setShowDots] = useState(false);
  const [lineClicked, setLineClicked] = useState(false);
  const [activeDot, setActiveDot] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragLine, setDragLine] = useState(false);
  const lineRef = useRef(null);
  const circle = [[100, 100], [150, 100]];

  // Generate initial points for the parabola
  const generateParabolaPoints = (centerX, centerY) => {
    const points = [];
    // Generate points from -10 to 10 with smaller steps for smoothness
    for (let x = -10; x <= 10; x += 1) {
      // Scale x and y to fit nicely in the square
      const scaledX = x * 20 + centerX; // Scale and shift x
      const scaledY = -(x * x) * 2 + centerY; // Scale and shift y, negative to flip parabola
      points.push({ x: scaledX, y: scaledY });
    }
    return points;
  };

  // State for all points of the curve
  const [points, setPoints] = useState(
    generateParabolaPoints(squareSize / 2, squareSize / 2)
  );

  // Handle line drag
  const handleMouseDown = (e) => {
    if (lineClicked && !activeDot) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      setDragLine({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        originalPoints: [...points]
      });
      setIsMouseDown(true);
    }
  };

  // Handle dot drag
  const handleDotMouseDown = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDot(index);
    setIsMouseDown(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isMouseDown) return;

      const rect = lineRef.current.parentElement.getBoundingClientRect();
      const x = Math.min(Math.max(0, e.clientX - rect.left), squareSize);
      const y = Math.min(Math.max(0, e.clientY - rect.top), squareSize);

      if (typeof activeDot === 'number') {
        // Move individual point
        const newPoints = [...points];
        newPoints[activeDot] = { x, y };
        setPoints(newPoints);
      } else if (dragLine) {
        // Move entire curve
        const dx = x - dragLine.startX;
        const dy = y - dragLine.startY;
        
        const newPoints = dragLine.originalPoints.map(point => ({
          x: Math.min(Math.max(0, point.x + dx), squareSize),
          y: Math.min(Math.max(0, point.y + dy), squareSize)
        }));
        setPoints(newPoints);
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
  }, [isMouseDown, activeDot, dragLine, squareSize, points]);

  const handleLineClick = (e) => {
    e.stopPropagation();
    setShowDots(true);
    setLineClicked(true);
  };

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
      <Circle initialCenter={circle[0]} initialEdgePoint={circle[1]} />
      <svg 
        ref={lineRef}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        width={squareSize} 
        height={squareSize}
      >
        {/* Invisible wider polyline for better hit detection */}
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          stroke="transparent"
          strokeWidth="10"
          fill="none"
          style={{ pointerEvents: 'all', cursor: 'pointer' }}
          onClick={handleLineClick}
        />
        {/* Visible polyline */}
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          stroke="red"
          strokeWidth="2"
          fill="none"
          style={{ pointerEvents: 'none' }}
        />
      </svg>

      {/* Dots */}
      {showDots && points.map((point, index) => (
        <div
          key={index}
          className="draggable-dot"
          style={{
            ...{
              width: activeDot === index ? '20px' : '5px',
              height: activeDot === index ? '20px' : '5px',
              backgroundColor: activeDot === index ? 'transparent' : 'red',
              border: '2px solid red',
              borderRadius: '50%',
              position: 'absolute',
              cursor: 'move',
              left: `${point.x - (activeDot === index ? 10 : 5)}px`,
              top: `${point.y - (activeDot === index ? 10 : 5)}px`,
            }
          }}
          onMouseDown={(e) => handleDotMouseDown(e, index)}
        />
      ))}
    </div>
  );
};

export default App;