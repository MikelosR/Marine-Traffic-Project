// src/pages/AisDataDisplay.jsx

import React, { useEffect, useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from '../utils/webSocketUtil';

export default function AisDataDisplay() {
  const [aisData, setAisData] = useState(null);

  useEffect(() => {
    // open the socket and register our callback
    connectWebSocket((data) => {
      setAisData(data);
    });

    // clean up on unmount
    return () => {
      disconnectWebSocket();
    };
  }, []);

  if (!aisData) {
    return <p>Waiting for AIS data…</p>;
  }

  return (
      <div>
        <h2>Latest AIS Update</h2>
        <ul>
          <li><strong>MMSI:</strong> {aisData.sourcemmsi}</li>
          <li><strong>Latitude:</strong> {aisData.lat}</li>
          <li><strong>Longitude:</strong> {aisData.lon}</li>
          <li><strong>Speed (knots):</strong> {aisData.speedoverground}</li>
          <li><strong>Course:</strong> {aisData.courseoverground}</li>
          <li><strong>Timestamp:</strong> {aisData.timestamp}</li>
          <li><strong>True Heading:</strong> {aisData.trueheading}</li>
          <li><strong>Navigational Status:</strong> {aisData.navigationalstatus}</li>
          <li><strong>Rate of Turn:</strong> {aisData.rateofturn}</li>
        </ul>
      </div>
  );
}
