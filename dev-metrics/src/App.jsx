import { useState } from 'react';
import { evaluateDeveloperMetrics } from './rulesEngine';
import MetricCard from './components/MetricCard';
import MetricDetails from './components/MetricDetails';
import './App.css';

function App() {
  const metricsData = evaluateDeveloperMetrics(); 
  const [selectedMetric, setSelectedMetric] = useState(null);

  const handleMetricSelect = (metric) => {
    setSelectedMetric(metric);
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Smart Developer Dashboard</h1>
        <p>Click on a metric to see insights and suggested actions.</p>
      </header>

      <div className="metrics-grid">
        {metricsData.map((metric) => (
          <MetricCard 
            key={metric.id} 
            metric={metric} 
            isSelected={selectedMetric?.id === metric.id}
            onCardClick={handleMetricSelect}
          />
        ))}
      </div>

      <MetricDetails metric={selectedMetric} />
    </div>
  );
}

export default App;