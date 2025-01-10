import React, { useState, useRef, useEffect } from 'react';

const Line = ({ squareSize, points }) => {
  const [curvePoints, setCurvePoints] = useState(points);
  const [showDots, setShowDots] = useState(false);
  const [activeDotIndex, setActiveDotIndex] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragLine, setDragLine] = useState(false);
  const lineRef = useRef(null);

  const HIT_TOLERANCE = 10;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (lineRef.current && !lineRef.current.contains(e.target)) {
        setShowDots(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (!isMouseDown) return;
  
      const rect = lineRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.min(Math.max(0, clientX - rect.left), squareSize);
      const y = Math.min(Math.max(0, clientY - rect.top), squareSize);
  
      if (activeDotIndex !== null) {
        const newPoints = [...curvePoints];
        newPoints[activeDotIndex] = [x, y];
        setCurvePoints(newPoints);
      } else if (dragLine) {
        const dx = x - dragLine.startX;
        const dy = y - dragLine.startY;
        
        const newPoints = dragLine.originalPoints.map(point => [
          Math.min(Math.max(0, point[0] + dx), squareSize),
          Math.min(Math.max(0, point[1] + dy), squareSize)
        ]);
        setCurvePoints(newPoints);
      }
    };
  
    const handleGlobalEnd = () => {
      setActiveDotIndex(null);
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
  }, [isMouseDown, activeDotIndex, dragLine, curvePoints, squareSize]);

  const handleDotMouseDown = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDotIndex(index);
    setIsMouseDown(true);
    setShowDots(true);
  };

  const handleLineMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = lineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setDragLine({
      startX: mouseX,
      startY: mouseY,
      originalPoints: [...curvePoints]
    });
    setIsMouseDown(true);
    setShowDots(true);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = lineRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    setDragLine({
      startX: touchX,
      startY: touchY,
      originalPoints: [...curvePoints]
    });
    setIsMouseDown(true);
    setShowDots(true);
  };

  return (
    <>
      <svg 
        ref={lineRef}
        width={squareSize} 
        height={squareSize}
        style={{ position: 'absolute', top: 0, left: 0 }}
        
      >
        {/* Invisible line for better hit detection */}
        <path
          d={`M ${curvePoints.map(p => `${p[0]} ${p[1]}`).join(' L ')}`}
          stroke="transparent"
          strokeWidth={HIT_TOLERANCE * 2}
          fill="none"
          style={{ cursor: 'move' }}
          pointerEvents="auto"
          onMouseDown={handleLineMouseDown}
          onTouchStart={handleTouchStart}
        />
        {/* Visible line */}
        <path
          d={`M ${curvePoints.map(p => `${p[0]} ${p[1]}`).join(' L ')}`}
          stroke="red"
          strokeWidth="2"
          fill="none"
          pointerEvents="none"
        />
      </svg>

      {showDots && curvePoints.map((point, index) => (
        <div
          key={index}
          className="draggable-dot"
          style={{
            width: activeDotIndex === index ? '20px' : '10px',
            height: activeDotIndex === index ? '20px' : '10px',
            backgroundColor: activeDotIndex === index ? 'transparent' : 'red',
            border: '2px solid red',
            borderRadius: '50%',
            position: 'absolute',
            cursor: 'move',
            left: `${point[0] - (activeDotIndex === index ? 10 : 5)}px`,
            top: `${point[1] - (activeDotIndex === index ? 10 : 5)}px`,
            touchAction: 'none',
            pointerEvents: "auto",
            zIndex: 10
          }}
          onMouseDown={(e) => handleDotMouseDown(e, index)}
        />
      ))}
    </>
  );
};

export default Line;