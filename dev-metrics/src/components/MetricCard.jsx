import React from 'react';

function MetricCard({ metric, isSelected, onCardClick }) {
  const cardClasses = `metric-card ${metric.status} ${isSelected ? 'active' : ''}`;

  return (
    <div className={cardClasses} onClick={() => onCardClick(metric)}>
      <h3>{metric.title}</h3>
      <p className="value">{metric.value}</p>
      <span className="status-badge">
        {metric.status === 'good' ? '✅ On Track' : '⚠️ Needs Attention'}
      </span>
    </div>
  );
}

export default MetricCard;