import React, { useState, useRef, useEffect } from 'react';

const Line = ({ squareSize, initialCenter, initialRandomPoint }) => {
  const [center, setCenter] = useState(initialCenter);
  const [randomPoint, setRandomPoint] = useState(initialRandomPoint);
  const [showDots, setShowDots] = useState(false);
  const [activeDot, setActiveDot] = useState(null);
  const [dragLine, setDragLine] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lineRef = useRef(null);

  const HIT_TOLERANCE = 5;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!lineRef.current.contains(e.target) && !e.target.classList.contains('draggable-dot')) {
        setShowDots(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (!isMouseDown) return;
  
      const rect = lineRef.current.ownerSVGElement.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.min(Math.max(0, clientX - rect.left), squareSize);
      const y = Math.min(Math.max(0, clientY - rect.top), squareSize);
  
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
  
    const handleGlobalEnd = () => {
      setActiveDot(null);
      setDragLine(false);
      setIsMouseDown(false);
    };
  
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('touchend', handleGlobalEnd);
  
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isMouseDown, activeDot, dragLine, squareSize]);

  const handleDotMouseDown = (e, dotType) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDot(dotType);
    setIsMouseDown(true);
  };

  const handleLineMouseDown = (e) => {
    e.preventDefault();
    const rect = lineRef.current.ownerSVGElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setDragLine({
      startX: mouseX,
      startY: mouseY,
      originalCenter: { ...center },
      originalRandom: { ...randomPoint }
    });
    setIsMouseDown(true);
    setShowDots(true);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = lineRef.current.ownerSVGElement.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (e.target.classList.contains('draggable-dot')) {
      const dotType = e.target.getAttribute('data-dot-type');
      setActiveDot(dotType);
    } else {
      setDragLine({
        startX: touchX,
        startY: touchY,
        originalCenter: { ...center },
        originalRandom: { ...randomPoint }
      });
    }
    setIsMouseDown(true);
    setShowDots(true);
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
    <>
      <svg 
        width={squareSize} 
        height={squareSize}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <line
            ref={lineRef}
            x1={center.x}
            y1={center.y}
            x2={randomPoint.x}
            y2={randomPoint.y}
            stroke="transparent"
            strokeWidth={HIT_TOLERANCE * 2}
            style={{ cursor: 'move', pointerEvents: 'auto' }}
            onMouseDown={handleLineMouseDown}
            onTouchStart={handleTouchStart}
            />
        <line
          x1={center.x}
          y1={center.y}
          x2={randomPoint.x}
          y2={randomPoint.y}
          stroke="red"
          strokeWidth="2"
        />
      </svg>

      <div
        className="draggable-dot"
        data-dot-type="center"
        style={{
          ...dotStyle(activeDot === 'center'),
          left: `${center.x - (activeDot === 'center' ? 10 : 5)}px`,
          top: `${center.y - (activeDot === 'center' ? 10 : 5)}px`,
          touchAction: 'none',
          pointerEvents:"visible"
        }}
        onMouseDown={(e) => handleDotMouseDown(e, 'center')}
        onTouchStart={(e) => handleTouchStart(e)}
      />

      <div
        className="draggable-dot"
        data-dot-type="random"
        style={{
          ...dotStyle(activeDot === 'random'),
          left: `${randomPoint.x - (activeDot === 'random' ? 10 : 5)}px`,
          top: `${randomPoint.y - (activeDot === 'random' ? 10 : 5)}px`,
          touchAction: 'none',
          pointerEvents:"visible"
        }}
        onMouseDown={(e) => handleDotMouseDown(e, 'random')}
        onTouchStart={(e) => handleTouchStart(e)}
      />
    </>
  );
};

export default Line;