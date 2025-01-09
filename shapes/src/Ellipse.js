import React, { useEffect, useRef, useState } from 'react';

const Ellipse = ({ ellipse: initialEllipse }) => {
  const canvasRef = useRef(null);
  const [ellipse, setEllipse] = useState(initialEllipse);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    if (!ellipse || ellipse.length !== 3) return;
    drawEllipse();
  }, [ellipse, isSelected, isDragging, draggedPointIndex]);

  function calculateEllipseParameters() {
    // First and last points are vertices on major axis
    const [p1, coVertex, p2] = ellipse;
    
    // Center is midpoint of vertices
    const center = [
      (p1[0] + p2[0]) / 2,
      (p1[1] + p2[1]) / 2
    ];
    
    // Semi-major axis length (a)
    const a = Math.sqrt(
      Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
    ) / 2;
    
    // Angle of rotation (major axis)
    const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    
    // Distance from center to co-vertex
    const coVertexDist = Math.sqrt(
      Math.pow(coVertex[0] - center[0], 2) + 
      Math.pow(coVertex[1] - center[1], 2)
    );
    
    // Semi-minor axis length (b)
    const b = coVertexDist;
    
    return { center, a, b, angle };
  }

  function drawEllipse() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { center, a, b, angle } = calculateEllipseParameters();
    
    // Draw ellipse
    ctx.beginPath();
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 2;
    
    for (let t = 0; t < 2 * Math.PI; t += 0.01) {
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      
      // Rotate and translate
      const xRot = center[0] + x * Math.cos(angle) - y * Math.sin(angle);
      const yRot = center[1] + x * Math.sin(angle) + y * Math.cos(angle);
      
      if (t === 0) {
        ctx.moveTo(xRot, yRot);
      } else {
        ctx.lineTo(xRot, yRot);
      }
    }
    
    ctx.closePath();
    ctx.stroke();

    // Draw points if selected
    if (isSelected) {
      ellipse.forEach((point, index) => {
        ctx.beginPath();
        
        if (index === draggedPointIndex) {
          ctx.arc(point[0], point[1], 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 0, 0)';
        } else {
          ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
          ctx.fillStyle = 'purple';
        }
        
        ctx.fill();
      });
    }
  }

  function isPointOnEllipse(x, y) {
    const { center, a, b, angle } = calculateEllipseParameters();
    
    // Transform point to ellipse coordinate system
    const xTranslated = x - center[0];
    const yTranslated = y - center[1];
    
    // Rotate point
    const xRotated = xTranslated * Math.cos(-angle) - yTranslated * Math.sin(-angle);
    const yRotated = xTranslated * Math.sin(-angle) + yTranslated * Math.cos(-angle);
    
    // Check if point is on ellipse (with tolerance)
    const tolerance = 5;
    const normalizedDistance = Math.pow(xRotated / a, 2) + Math.pow(yRotated / b, 2);
    return Math.abs(normalizedDistance - 1) < tolerance / Math.min(a, b);
  }

  function isPointNearControlPoint(x, y) {
    return ellipse.findIndex(point => 
      Math.sqrt(Math.pow(x - point[0], 2) + Math.pow(y - point[1], 2)) < 5
    );
  }

  function handleMouseDown(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const controlPointIndex = isPointNearControlPoint(x, y);
    
    if (controlPointIndex !== -1) {
      setIsDragging(true);
      setDraggedPointIndex(controlPointIndex);
      setDragStart([x, y]);
      setIsSelected(true);
    } else if (isPointOnEllipse(x, y)) {
      setIsDragging(true);
      setDraggedPointIndex(null);
      setDragStart([x, y]);
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedPointIndex !== null) {
      // Moving a control point
      const newEllipse = [...ellipse];
      newEllipse[draggedPointIndex] = [x, y];
      setEllipse(newEllipse);
    } else {
      // Moving the entire ellipse
      const dx = x - dragStart[0];
      const dy = y - dragStart[1];

      const newEllipse = ellipse.map(point => [
        point[0] + dx,
        point[1] + dy
      ]);

      setEllipse(newEllipse);
      setDragStart([x, y]);
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
    setDraggedPointIndex(null);
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={400}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{  position: 'absolute', top: 0, left: 0, cursor: isDragging ? 'grabbing' : isSelected ? 'grab' : 'default', pointerEvents:"visible"}}
    />
  );
};

export default Ellipse;