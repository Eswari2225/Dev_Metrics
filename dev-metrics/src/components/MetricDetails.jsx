import React from 'react';

function MetricDetails({ metric }) {
  if (!metric) return null;

  return (
    <div className="details-panel">
      <h2>Investigating: {metric.title}</h2>
      
      <div className="insight-box">
        <strong>🧠 Insight (The Why):</strong>
        <p>{metric.insight}</p>
      </div>
      
      <div className="action-box">
        <strong>🚀 Suggested Action (The What Next):</strong>
        <p>{metric.action}</p>
      </div>
    </div>
  );
}

export default MetricDetails;