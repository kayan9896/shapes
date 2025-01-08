import React, { useState, useEffect, useRef } from 'react';

const Circle = ({ center, edgePoint, onCenterChange, onEdgePointChange }) => {
    const [isDraggingCenter, setIsDraggingCenter] = useState(false);
    const [isDraggingEdge, setIsDraggingEdge] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const svgRef = useRef(null);
  
    // Calculate radius
    const calculateRadius = () => {
      return Math.sqrt(
        Math.pow(edgePoint[0] - center[0], 2) + 
        Math.pow(edgePoint[1] - center[1], 2)
      );
    };
  
    // Handle mouse events
    const handleMouseDown = (e, isCenter) => {
      if (isCenter) {
        setIsDraggingCenter(true);
      } else {
        setIsDraggingEdge(true);
      }
    };
  
    const handleMouseMove = (e) => {
      if (!isDraggingCenter && !isDraggingEdge) return;
  
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
  
      if (isDraggingCenter) {
        const dx = x - center[0];
        const dy = y - center[1];
        onCenterChange([x, y]);
        onEdgePointChange([edgePoint[0] + dx, edgePoint[1] + dy]);
      } else if (isDraggingEdge) {
        onEdgePointChange([x, y]);
      }
    };
  
    const handleMouseUp = () => {
      setIsDraggingCenter(false);
      setIsDraggingEdge(false);
    };
  
    const handleCircleClick = () => {
      setIsEditing(!isEditing);
    };
  
    useEffect(() => {
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

  return (
    <svg 
      ref={svgRef}
      width="100%" 
      height="100%" 
      onMouseMove={handleMouseMove}
      style={{ cursor: isDraggingCenter || isDraggingEdge ? 'grabbing' : 'default' }}
    >
      {/* Circle */}
      <circle
        cx={center[0]}
        cy={center[1]}
        r={calculateRadius()}
        fill="none"
        stroke="blue"
        strokeWidth="2"
        onClick={handleCircleClick}
        style={{ cursor: 'pointer' }}
      />
      
      {isEditing && (
        <>
          {/* Center point */}
          <circle
            cx={center[0]}
            cy={center[1]}
            r="5"
            fill="blue"
            cursor="grab"
            onMouseDown={(e) => handleMouseDown(e, true)}
          />
          
          {/* Edge point */}
          <circle
            cx={edgePoint[0]}
            cy={edgePoint[1]}
            r="5"
            fill="blue"
            cursor="grab"
            onMouseDown={(e) => handleMouseDown(e, false)}
          />
        </>
      )}
    </svg>
  );
};

export default Circle;