import React, { useState } from 'react';
import Circle from './Circle';

const App = () => {
  // Initial circle coordinates
  const [center, setCenter] = useState([100, 100]);
  const [edgePoint, setEdgePoint] = useState([150, 100]);

  const handleCenterChange = (newCenter) => {
    setCenter(newCenter);
    console.log("New center:", newCenter);
  };

  const handleEdgePointChange = (newEdgePoint) => {
    setEdgePoint(newEdgePoint);
    console.log("New edge point:", newEdgePoint);
  };

  return (
    <div style={{ width: '500px', height: '500px' }}>
      <Circle 
        center={center}
        edgePoint={edgePoint}
        onCenterChange={handleCenterChange}
        onEdgePointChange={handleEdgePointChange}
      />
      <div>
        <p>Center: ({center[0]}, {center[1]})</p>
        <p>Edge Point: ({edgePoint[0]}, {edgePoint[1]})</p>
      </div>
    </div>
  );
};

export default App;