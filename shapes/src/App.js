import React, { useState, useCallback } from 'react';
import Circle from './Circle';
import Arc from './Arc';
import Ellipse from './Ellipse';
import Line from './Line';

const App = () => {
  const squareSize = 400;
  const [ccenter, setcCenter] = useState([100, 100]);
  const [edgePoint, setEdgePoint] = useState([150, 100]);

  const arcPoints = [
    [50, 50],   // First point (x1, y1)
    [100, 100], // Second point (x2, y2)
    [100, 0]    // Third point (x3, y3)
  ];

  const ellipsePoints = [
    [50, 100],   // First vertex
    [100, 50],   // Co-vertex
    [150, 100]   // Second vertex
  ];

  const handleCenterChange = useCallback((newCenter) => {
    setcCenter(newCenter);
    console.log("New center:", newCenter);
  }, []);

  const handleEdgePointChange = useCallback((newEdgePoint) => {
    setEdgePoint(newEdgePoint);
    console.log("New edge point:", newEdgePoint);
  }, []);

  return (
    <div 
      style={{ 
        width: `${squareSize}px`, 
        height: `${squareSize}px`, 
        border: '1px solid black', 
        position: 'relative',
        touchAction: 'none',
      }}
    >
      <img 
        src={require("./drr.png")} 
        alt="Square content" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',pointerEvents:"none" }}>
        <Circle 
          center={ccenter}
          edgePoint={edgePoint}
          onCenterChange={handleCenterChange}
          onEdgePointChange={handleEdgePointChange}
        />
        <Arc arc={arcPoints} />
        <Ellipse ellipse={ellipsePoints} />
        <Line 
          squareSize={squareSize} 
          initialCenter={{ x: squareSize / 2, y: squareSize / 2 }}
          initialRandomPoint={{
            x: Math.random() * squareSize,
            y: Math.random() * squareSize
          }}
        />
      </div>
      <div>
        <p>Center: ({ccenter[0]}, {ccenter[1]})</p>
        <p>Edge Point: ({edgePoint[0]}, {edgePoint[1]})</p>
      </div>
    </div>
  );
};

export default App;