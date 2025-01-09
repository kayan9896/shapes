import React, { useEffect, useRef, useState } from 'react';

const Arc = ({ arc: initialArc }) => {
  const canvasRef = useRef(null);
  const [arc, setArc] = useState(initialArc);
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    if (!arc || arc.length !== 3) return;
    drawArc();
  }, [arc, isSelected, isDragging, draggedPointIndex]);

  function findCircle(p1, p2, p3) {
    const x1 = p1[0], y1 = p1[1];
    const x2 = p2[0], y2 = p2[1];
    const x3 = p3[0], y3 = p3[1];
    
    const a = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
    const b = (x1 * x1 + y1 * y1) * (y3 - y2) + 
              (x2 * x2 + y2 * y2) * (y1 - y3) + 
              (x3 * x3 + y3 * y3) * (y2 - y1);
    const c = (x1 * x1 + y1 * y1) * (x2 - x3) + 
              (x2 * x2 + y2 * y2) * (x3 - x1) + 
              (x3 * x3 + y3 * y3) * (x1 - x2);
    
    const x = -b / (2 * a);
    const y = -c / (2 * a);
    
    const radius = Math.sqrt(
      Math.pow(x - x1, 2) + Math.pow(y - y1, 2)
    );
    
    return { center: [x, y], radius };
  }

  function calculateAngle(center, point) {
    return Math.atan2(point[1] - center[1], point[0] - center[0]);
  }

  function drawArc() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { center, radius } = findCircle(arc[0], arc[1], arc[2]);
    let startAngle = calculateAngle(center, arc[0]);
    let midAngle = calculateAngle(center, arc[1]);
    let endAngle = calculateAngle(center, arc[2]);

    startAngle = (startAngle + 2 * Math.PI) % (2 * Math.PI);
    midAngle = (midAngle + 2 * Math.PI) % (2 * Math.PI);
    endAngle = (endAngle + 2 * Math.PI) % (2 * Math.PI);

    let counterclockwise = true;
    if (startAngle < endAngle) {
      if(midAngle < startAngle && midAngle > endAngle) counterclockwise=false
    } else {
      counterclockwise = (midAngle > endAngle && midAngle < startAngle);
    }

    // Draw arc
    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.arc(center[0], center[1], radius, startAngle, endAngle, counterclockwise);
    ctx.stroke();

    // Draw points if selected
    if (isSelected) {
      arc.forEach((point, index) => {
        ctx.beginPath();
        
        // Enlarged and transparent if being dragged
        if (index === draggedPointIndex) {
          ctx.arc(point[0], point[1], 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        } else {
          ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
          ctx.fillStyle = 'yellow';
        }
        
        ctx.fill();
      });
    }
  }

  function isPointOnArc(x, y) {
    const { center, radius } = findCircle(arc[0], arc[1], arc[2]);
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2)
    );
    return Math.abs(distanceFromCenter - radius) < 5;
  }

  function isPointNearControlPoint(x, y) {
    return arc.findIndex(point => 
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
    } else if (isPointOnArc(x, y)) {
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
      const newArc = [...arc];
      newArc[draggedPointIndex] = [x, y];
      setArc(newArc);
    } else {
      // Moving the entire arc
      const dx = x - dragStart[0];
      const dy = y - dragStart[1];

      const newArc = arc.map(point => [
        point[0] + dx,
        point[1] + dy
      ]);

      setArc(newArc);
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
      style={{ cursor: isDragging ? 'grabbing' : isSelected ? 'grab' : 'default' }}
    />
  );
};

export default Arc;