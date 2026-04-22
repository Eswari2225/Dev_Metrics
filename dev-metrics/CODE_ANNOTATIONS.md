# 📌 ANNOTATED SOURCE CODE - Where Logic Lives

## Complete Guide to Finding Logic in Your Codebase

---

## 1. DATA LAYER - `src/data.json`

### Location in File Structure
```
dev-metrics/
└── src/
    └── data.json  ← YOU ARE HERE
```

### Full Code with Annotations
```json
{
  // ═══════════════════════════════════════════════════════════
  // RAW METRICS DATA (NO LOGIC, JUST NUMBERS)
  // ═══════════════════════════════════════════════════════════
  // These numbers come from your backend API or database
  // They are UNEVALUATED - the rules engine will judge them
  
  "leadTime": 3,
  // └─ Question: How many days from commit to production?
  //    Value: 3 days
  //    Evaluated by: rulesEngine.js (Rule #1)
  //    Rule: If 3 <= 7 → "good", else "bad"
  //    Result: "good" (because 3 is less than target of 7)
  
  "cycleTime": 8,
  // └─ Question: How many days from task start to completion?
  //    Value: 8 days
  //    Evaluated by: rulesEngine.js (Rule #2)
  //    Rule: If 8 <= 4 → "good", else "bad"
  //    Result: "bad" (because 8 exceeds target of 4)
  
  "bugRate": 15,
  // └─ Question: What percentage of code has bugs?
  //    Value: 15%
  //    Evaluated by: rulesEngine.js (Rule #3)
  //    Rule: If 15 <= 10 → "good", else "bad"
  //    Result: "bad" (because 15 exceeds target of 10)
  
  "deploys": 4,
  // └─ Question: How many times per week do we deploy?
  //    Value: 4 times/week
  //    Evaluated by: rulesEngine.js (Rule #4)
  //    Rule: If 4 >= 2 → "good", else "bad"
  //    Result: "good" (because 4 meets target of 2+)
  
  "prs": 5
  // └─ Question: How many PRs merged this week?
  //    Value: 5 PRs
  //    Evaluated by: rulesEngine.js (Rule #5)
  //    Rule: If 5 >= 3 → "good", else "bad"
  //    Result: "good" (because 5 meets target of 3+)
}
// ═══════════════════════════════════════════════════════════
// FLOW:
// data.json (raw values)
//    ↓ (imported by rulesEngine.js)
// rulesEngine.js (applies business logic)
//    ↓ (returns evaluated metrics)
// App.jsx (receives decisions)
//    ↓ (passes to components)
// MetricCard.jsx (renders based on status)
// ═══════════════════════════════════════════════════════════
```

---

## 2. LOGIC LAYER - `src/rulesEngine.js`

### Location in File Structure
```
dev-metrics/
└── src/
    └── rulesEngine.js  ← YOU ARE HERE (THE HEART OF THE APP)
```

### Full Code with Line-by-Line Annotations

```javascript
// ═══════════════════════════════════════════════════════════
// FILE: src/rulesEngine.js
// PURPOSE: All business logic & rules evaluation
// STATUS: This is where all the "intelligence" lives
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// LINE 1: IMPORT RAW DATA
// ───────────────────────────────────────────────────────────
import rawData from './data.json';
// ↑ LAYER INTERACTION: DATA LAYER → LOGIC LAYER
// Result: { leadTime: 3, cycleTime: 8, bugRate: 15, deploys: 4, prs: 5 }
// Purpose: Get raw, unevaluated metrics to apply rules to
// This is the ONLY place in the app that imports raw data directly

// ───────────────────────────────────────────────────────────
// LINES 3-9: DEFINE INDUSTRY STANDARDS
// ───────────────────────────────────────────────────────────
const TARGETS = {
  // ┌─────────────────────────────────────────────────────┐
  // │ MAXIMUM-TYPE TARGETS (Lower is Better)              │
  // │ Rule: If actual <= target → "good"                  │
  // │ Example: maxLeadTime=7 means "good" if ≤7 days      │
  // └─────────────────────────────────────────────────────┘
  
  maxLeadTime: 7,
  // └─ DORA Report Standard
  //    Source: https://dora.dev
  //    Meaning: Elite performers get code to production within 7 days
  //    How it's used: rawData.leadTime <= 7 ? "good" : "bad"
  //    Current value: 3 (actual) vs 7 (target) → GOOD
  
  maxCycleTime: 4,
  // └─ Kanban Best Practice
  //    Meaning: Tasks should be completable in 4 days or less
  //    Larger tasks = higher risk, harder to complete
  //    How it's used: rawData.cycleTime <= 4 ? "good" : "bad"
  //    Current value: 8 (actual) vs 4 (target) → BAD
  
  maxBugRate: 10,
  // └─ Quality Industry Standard
  //    Meaning: Accept ≤10% defect rate in production
  //    Higher bug rate = poor quality, customer impact
  //    How it's used: rawData.bugRate <= 10 ? "good" : "bad"
  //    Current value: 15 (actual) vs 10 (target) → BAD
  
  // ┌─────────────────────────────────────────────────────┐
  // │ MINIMUM-TYPE TARGETS (Higher is Better)             │
  // │ Rule: If actual >= target → "good"                  │
  // │ Example: minDeploys=2 means "good" if ≥2 per week   │
  // └─────────────────────────────────────────────────────┘
  
  minDeploys: 2,
  // └─ DORA Report Standard (Deployment Frequency)
  //    Meaning: Good teams deploy at least 2+ times per week
  //    Frequent deploys = lower risk, faster feedback
  //    How it's used: rawData.deploys >= 2 ? "good" : "bad"
  //    Current value: 4 (actual) vs 2 (target) → GOOD
  
  minPrs: 3
  // └─ GitHub Workflow Convention
  //    Meaning: Merge at least 3 PRs per week for healthy flow
  //    More PRs = smoother workflow, less blocking
  //    How it's used: rawData.prs >= 3 ? "good" : "bad"
  //    Current value: 5 (actual) vs 3 (target) → GOOD
};
// ↑ THESE TARGETS ARE THE FOUNDATION OF ALL DECISIONS IN THIS APP

// ───────────────────────────────────────────────────────────
// LINE 11: EXPORT MAIN EVALUATION FUNCTION
// ───────────────────────────────────────────────────────────
export function evaluateDeveloperMetrics() {
  // ┌─────────────────────────────────────────────────────┐
  // │ THIS FUNCTION IS CALLED BY App.jsx                  │
  // │ IT IS THE BRIDGE BETWEEN LOGIC AND UI LAYERS        │
  // └─────────────────────────────────────────────────────┘
  
  const metrics = [];
  // Initialize empty array to store evaluated metrics
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 1: LEAD TIME EVALUATION
  // ═══════════════════════════════════════════════════════════
  
  // ───────────────────────────────────────────────────────────
  // LINE 13: APPLY RULE #1
  // ───────────────────────────────────────────────────────────
  const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
  // ↑ RULE APPLICATION: Compare actual value to target
  // Breakdown:
  //   rawData.leadTime = 3 (actual value from data.json)
  //   TARGETS.maxLeadTime = 7 (industry standard)
  //   3 <= 7? → YES → TRUE
  //   Meaning: Lead time is "good" (meets standards)
  //
  // Alternative scenarios:
  //   If leadTime was 10: 10 <= 7? → NO → FALSE → status = "bad"
  //   If leadTime was 7:  7 <= 7? → YES → TRUE → status = "good"
  
  // ───────────────────────────────────────────────────────────
  // LINES 14-22: BUILD METRIC OBJECT #1
  // ───────────────────────────────────────────────────────────
  metrics.push({
    id: 1,
    // └─ Unique identifier for this metric (used as React key)
    
    title: "Lead Time",
    // └─ Display name in MetricCard and MetricDetails
    
    value: `${rawData.leadTime} Days`,
    // └─ Display value (e.g., "3 Days")
    //    This is raw data formatted for display
    
    status: isLeadTimeGood ? "good" : "bad",
    // ↑ DECISION: RULE RESULT BECOMES STATUS
    // If isLeadTimeGood is TRUE → status = "good"
    // If isLeadTimeGood is FALSE → status = "bad"
    // Current: TRUE → status = "good"
    //
    // WHERE THIS AFFECTS UI:
    //   MetricCard.jsx line 4: const cardClasses = `metric-card ${metric.status}`
    //   - If status="good": CSS applies .metric-card.good (green background)
    //   - If status="bad": CSS applies .metric-card.bad (red background)
    
    insight: isLeadTimeGood 
      ? "Code reaches production quickly."
      // └─ POSITIVE interpretation of rule success
      //    Displayed when status = "good"
      //    Reinforces positive behavior
      : "Code is sitting unreleased for too long.",
      // └─ NEGATIVE interpretation of rule failure
      //    Displayed when status = "bad"
      //    Explains the problem
    
    action: isLeadTimeGood 
      ? "Keep it up."
      // └─ ENCOURAGEMENT when performing well
      //    User-friendly suggestion when metric is good
      : "Review PRs faster to unblock releases."
      // └─ ACTIONABLE SOLUTION when underperforming
      //    Specific suggestion to improve the metric
  });
  // ↑ END OF METRIC #1
  // ↑ This object is added to the metrics array
  // ↑ Will be passed to App.jsx, then to MetricCard, then to DOM
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 2: CYCLE TIME EVALUATION
  // ═══════════════════════════════════════════════════════════
  
  const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
  // Compare: 8 <= 4? → FALSE → status will be "bad"
  // Meaning: Tasks are taking too long (8 days vs target 4 days)
  
  metrics.push({
    id: 2,
    title: "Cycle Time",
    value: `${rawData.cycleTime} Days`,
    status: isCycleTimeGood ? "good" : "bad",
    // Will be "bad" because rule is FALSE
    
    insight: isCycleTimeGood 
      ? "Tasks are completed at a healthy pace."
      : "Tasks are taking too long to complete.",
      // Will display: "Tasks are taking too long to complete."
    
    action: isCycleTimeGood 
      ? "Keep it up."
      : "Break Jira tickets into smaller 1-2 day tasks."
      // Will display: "Break Jira tickets into smaller 1-2 day tasks."
  });
  // ↑ END OF METRIC #2
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 3: BUG RATE EVALUATION
  // ═══════════════════════════════════════════════════════════
  
  const isBugRateGood = rawData.bugRate <= TARGETS.maxBugRate;
  // Compare: 15 <= 10? → FALSE → status will be "bad"
  // Meaning: Quality is poor (15% defect rate vs target 10%)
  
  metrics.push({
    id: 3,
    title: "Bug Rate",
    value: `${rawData.bugRate}%`,
    status: isBugRateGood ? "good" : "bad",
    // Will be "bad" because rule is FALSE
    
    insight: isBugRateGood 
      ? "Your code is highly stable."
      : "Quality issues are slipping into production.",
      // Will display: "Quality issues are slipping into production."
    
    action: isBugRateGood 
      ? "Keep it up."
      : "Add automated unit tests before requesting a review."
      // Will display: "Add automated unit tests before requesting a review."
  });
  // ↑ END OF METRIC #3
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 4: DEPLOY FREQUENCY EVALUATION
  // ═══════════════════════════════════════════════════════════
  
  const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
  // ↑ NOTE: This rule uses >= (minimum) instead of <=
  //    WHY: For this metric, HIGHER is better
  //    Compare: 4 >= 2? → TRUE → status will be "good"
  //    Meaning: Deployment frequency is healthy (4x/week vs target 2x/week)
  
  metrics.push({
    id: 4,
    title: "Deploy Frequency",
    value: `${rawData.deploys}/week`,
    status: isDeploysGood ? "good" : "bad",
    // Will be "good" because rule is TRUE
    
    insight: isDeploysGood 
      ? "You are deploying consistently."
      // Will display: "You are deploying consistently."
      : "You are not releasing code often enough.",
    
    action: isDeploysGood 
      ? "Keep it up."
      // Will display: "Keep it up."
      : "Push smaller, safer updates to production."
  });
  // ↑ END OF METRIC #4
  
  // ═══════════════════════════════════════════════════════════
  // SECTION 5: PR THROUGHPUT EVALUATION
  // ═══════════════════════════════════════════════════════════
  
  const isPrsGood = rawData.prs >= TARGETS.minPrs;
  // ↑ NOTE: This rule uses >= (minimum) instead of <=
  //    WHY: For this metric, HIGHER is better
  //    Compare: 5 >= 3? → TRUE → status will be "good"
  //    Meaning: Code review flow is healthy (5 PRs vs target 3 PRs)
  
  metrics.push({
    id: 5,
    title: "PR Throughput",
    value: `${rawData.prs} PRs`,
    status: isPrsGood ? "good" : "bad",
    // Will be "good" because rule is TRUE
    
    insight: isPrsGood 
      ? "Healthy amount of code being merged."
      // Will display: "Healthy amount of code being merged."
      : "Very little code is being merged.",
    
    action: isPrsGood 
      ? "Keep it up."
      // Will display: "Keep it up."
      : "Focus on finishing current tasks before starting new ones."
  });
  // ↑ END OF METRIC #5
  
  // ───────────────────────────────────────────────────────────
  // LINE 63: RETURN EVALUATED METRICS
  // ───────────────────────────────────────────────────────────
  return metrics;
  // Returns array of 5 metric objects:
  // [
  //   {id:1, title:"Lead Time", status:"good", insight:"...", action:"..."},
  //   {id:2, title:"Cycle Time", status:"bad", insight:"...", action:"..."},
  //   {id:3, title:"Bug Rate", status:"bad", insight:"...", action:"..."},
  //   {id:4, title:"Deploy Frequency", status:"good", insight:"...", action:"..."},
  //   {id:5, title:"PR Throughput", status:"good", insight:"...", action:"..."}
  // ]
  // ↑ LAYER INTERACTION: LOGIC LAYER → UI LAYER
  // ↑ LAYER INTERACTION: rulesEngine.js → App.jsx
  // ↑ This is the ONLY output of the logic layer
  // ↑ All 5 metrics are now ready for display
}
// ═══════════════════════════════════════════════════════════
// END OF LOGIC LAYER
// ═══════════════════════════════════════════════════════════
```

---

## 3. UI LAYER - `src/App.jsx`

### Location in File Structure
```
dev-metrics/
└── src/
    └── App.jsx  ← YOU ARE HERE (UI ORCHESTRATION)
```

### Full Code with Line-by-Line Annotations

```javascript
// ═══════════════════════════════════════════════════════════
// FILE: src/App.jsx
// PURPOSE: Orchestrate data flow & manage UI state
// RESPONSIBILITY: Call rules engine, pass data to components
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// LINES 1-5: IMPORTS
// ───────────────────────────────────────────────────────────
import { useState } from 'react';
// └─ Hook for managing UI state (which card is selected)

import { evaluateDeveloperMetrics } from './rulesEngine';
// ↑ IMPORTS RULES ENGINE FUNCTION
// └─ This is the ONLY import of business logic in the UI
// └─ Purpose: Call rules engine to evaluate metrics
// └─ Returns: Array of 5 evaluated metric objects

import MetricCard from './components/MetricCard';
// └─ Dumb component that renders card UI

import MetricDetails from './components/MetricDetails';
// └─ Dumb component that renders detail panel

import './App.css';
// └─ Styling

// ───────────────────────────────────────────────────────────
// LINE 7: COMPONENT DEFINITION
// ───────────────────────────────────────────────────────────
function App() {
  // ┌─────────────────────────────────────────────────────┐
  // │ THIS IS THE "SMART" COMPONENT                        │
  // │ It knows about business logic                        │
  // │ It knows about state management                      │
  // │ It orchestrates the data flow                        │
  // └─────────────────────────────────────────────────────┘
  
  // ───────────────────────────────────────────────────────────
  // LINE 8-9: CALL RULES ENGINE
  // ───────────────────────────────────────────────────────────
  const metricsData = evaluateDeveloperMetrics();
  // ↑ THIS LINE CONNECTS UI LAYER TO LOGIC LAYER
  // ↑ LAYER INTERACTION: App.jsx → rulesEngine.js
  //
  // Execution:
  //   1. App component loads
  //   2. This line executes
  //   3. Control transfers to rulesEngine.js
  //   4. rulesEngine.js evaluates all 5 rules
  //   5. Returns array of evaluated metrics
  //   6. Control returns here with results
  //
  // Result: metricsData = [
  //   {id:1, title:"Lead Time", status:"good", ...},
  //   {id:2, title:"Cycle Time", status:"bad", ...},
  //   {id:3, title:"Bug Rate", status:"bad", ...},
  //   {id:4, title:"Deploy Frequency", status:"good", ...},
  //   {id:5, title:"PR Throughput", status:"good", ...}
  // ]
  //
  // Key Point: This is the ONLY place in UI that calls business logic
  // Everything else is just UI state and rendering

  // ───────────────────────────────────────────────────────────
  // LINE 10: MANAGE UI STATE
  // ───────────────────────────────────────────────────────────
  const [selectedMetric, setSelectedMetric] = useState(null);
  // └─ React hook for tracking which metric card user clicked
  // └─ Initial value: null (no card selected yet)
  // └─ When user clicks a card: selectedMetric = that metric object
  // └─ Purpose: Highlight the clicked card + show details below
  //
  // Example flow:
  //   1. Initial: selectedMetric = null
  //   2. User clicks "Cycle Time" card
  //   3. setSelectedMetric({id:2, title:"Cycle Time", ...})
  //   4. selectedMetric now = that metric object
  //   5. App re-renders
  //   6. MetricDetails now shows "Cycle Time" insight & action

  // ───────────────────────────────────────────────────────────
  // LINE 12-14: CLICK HANDLER
  // ───────────────────────────────────────────────────────────
  const handleMetricSelect = (metric) => {
    // This function is called when user clicks a metric card
    setSelectedMetric(metric);  // Update state
    // Result: selectedMetric = the clicked metric
  };

  // ───────────────────────────────────────────────────────────
  // LINE 16-31: RENDER JSX
  // ───────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="header">
        <h1>Smart Developer Dashboard</h1>
        <p>Click on a metric to see insights and suggested actions.</p>
      </header>

      {/* Metrics Grid Section */}
      <div className="metrics-grid">
        {/* ─────────────────────────────────────────────────────────
            LINE 26-35: MAP OVER EVALUATED METRICS
            ─────────────────────────────────────────────────────────
        */}
        {metricsData.map((metric) => (
          // ↑ Loop through array of 5 evaluated metrics
          //   metric = {id:1, title:"Lead Time", status:"good", ...}
          
          <MetricCard 
            key={metric.id}
            // └─ React list key (required for efficient rendering)
            
            metric={metric}
            // ↑ PASS EVALUATED DATA TO CARD COMPONENT
            // └─ MetricCard receives: {id:1, title:"Lead Time", status:"good", ...}
            // └─ MetricCard uses metric.status to determine card color
            // └─ MetricCard uses metric.title for display
            // └─ MetricCard uses metric.value for display
            
            isSelected={selectedMetric?.id === metric.id}
            // ↑ CHECK IF THIS CARD IS SELECTED
            // └─ If user clicked this card: isSelected = true (highlight it)
            // └─ If user clicked different card: isSelected = false
            // └─ Optional chaining (?.) handles case when selectedMetric = null
            
            onCardClick={handleMetricSelect}
            // └─ Pass click handler to component
            // └─ When user clicks card, handleMetricSelect is called
          />
        ))}
      </div>

      {/* Detail Panel Section */}
      <MetricDetails metric={selectedMetric} />
      // ↑ PASS SELECTED METRIC TO DETAILS COMPONENT
      // └─ If selectedMetric = null: shows nothing
      // └─ If selectedMetric = {id:2, ...}: shows details for metric #2
      // └─ This panel updates when user clicks different cards
    </div>
  );
  // ↑ END OF RENDER
}

export default App;
// ═══════════════════════════════════════════════════════════
```

---

## 4. UI LAYER - `src/components/MetricCard.jsx`

### Location in File Structure
```
dev-metrics/
└── src/
    └── components/
        └── MetricCard.jsx  ← YOU ARE HERE (DUMB COMPONENT)
```

### Full Code with Line-by-Line Annotations

```javascript
// ═══════════════════════════════════════════════════════════
// FILE: src/components/MetricCard.jsx
// PURPOSE: Display a single metric card
// RESPONSIBILITY: Only presentation, no business logic
// ═══════════════════════════════════════════════════════════

import React from 'react';

// ───────────────────────────────────────────────────────────
// LINE 4: COMPONENT DEFINITION
// ───────────────────────────────────────────────────────────
function MetricCard({ metric, isSelected, onCardClick }) {
  // RECEIVES 3 PROPS:
  // 1. metric: {id, title, value, status, insight, action}
  //    └─ Fully evaluated metric from rules engine
  // 2. isSelected: boolean
  //    └─ Is this card currently selected?
  // 3. onCardClick: function
  //    └─ What to do when user clicks this card?
  
  // Key Point: This component has NO business logic
  //   - Doesn't calculate status
  //   - Doesn't compare values
  //   - Doesn't have decision logic
  //   - Just receives data and renders it

  // ───────────────────────────────────────────────────────────
  // LINE 4: BUILD CSS CLASSES
  // ───────────────────────────────────────────────────────────
  const cardClasses = `metric-card ${metric.status} ${isSelected ? 'active' : ''}`;
  // ↑ USES metric.status FROM RULES ENGINE
  //   └─ metric.status comes from rulesEngine.js evaluation
  //   └─ If metric.status = "good": CSS class includes "good"
  //      └─ In App.css: .metric-card.good { background-color: green; }
  //   └─ If metric.status = "bad": CSS class includes "bad"
  //      └─ In App.css: .metric-card.bad { background-color: red; }
  // ↑ CONDITIONAL CLASS
  //   └─ If isSelected = true: CSS class includes "active"
  //      └─ In App.css: .metric-card.active { box-shadow: bold; }

  return (
    // ───────────────────────────────────────────────────────────
    // LINE 7-12: RENDER CARD
    // ───────────────────────────────────────────────────────────
    <div className={cardClasses} onClick={() => onCardClick(metric)}>
    // ↑ CLICKABLE CARD
    //   └─ When user clicks: onCardClick(metric) is called
    //   └─ This updates App.jsx state: setSelectedMetric(metric)
    //   └─ App re-renders with this card highlighted
    
      <h3>{metric.title}</h3>
      // └─ Display metric name
      //    Examples: "Lead Time", "Cycle Time", "Bug Rate"
      
      <p className="value">{metric.value}</p>
      // └─ Display metric value
      //    Examples: "3 Days", "8 Days", "15%"
      
      <span className="status-badge">
        {metric.status === 'good' ? '✅ On Track' : '⚠️ Needs Attention'}
        // ↑ CONDITIONAL EMOJI & TEXT
        //   └─ If metric.status = "good": shows ✅ On Track (green)
        //   └─ If metric.status = "bad": shows ⚠️ Needs Attention (red)
        //   └─ This is the ONLY logic in this component
        //   └─ Decision was made in rulesEngine.js
      </span>
    </div>
  );
}

export default MetricCard;
// ═══════════════════════════════════════════════════════════
```

---

## 5. UI LAYER - `src/components/MetricDetails.jsx`

### Location in File Structure
```
dev-metrics/
└── src/
    └── components/
        └── MetricDetails.jsx  ← YOU ARE HERE (DUMB COMPONENT)
```

### Full Code with Line-by-Line Annotations

```javascript
// ═══════════════════════════════════════════════════════════
// FILE: src/components/MetricDetails.jsx
// PURPOSE: Display detailed insight & action for selected metric
// RESPONSIBILITY: Only presentation, no business logic
// ═══════════════════════════════════════════════════════════

import React from 'react';

// ───────────────────────────────────────────────────────────
// LINE 4: COMPONENT DEFINITION
// ───────────────────────────────────────────────────────────
function MetricDetails({ metric }) {
  // RECEIVES 1 PROP:
  // metric: {id, title, value, status, insight, action}
  //         OR null if no metric selected
  //
  // Key Point: This component has NO business logic
  //   - Doesn't calculate insight
  //   - Doesn't generate action
  //   - Just receives them and displays them

  // ───────────────────────────────────────────────────────────
  // LINE 5: HANDLE NO SELECTION
  // ───────────────────────────────────────────────────────────
  if (!metric) return null;
  // └─ If no card selected: render nothing
  // └─ Only show details panel when user clicks a card

  return (
    // ───────────────────────────────────────────────────────────
    // LINES 7-20: RENDER DETAILS PANEL
    // ───────────────────────────────────────────────────────────
    <div className="details-panel">
      <h2>Investigating: {metric.title}</h2>
      // └─ Show which metric is being investigated
      //    Examples: "Investigating: Lead Time", "Investigating: Bug Rate"
      
      <div className="insight-box">
        <strong>🧠 Insight (The Why):</strong>
        <p>{metric.insight}</p>
        // ↑ DISPLAY INSIGHT FROM RULES ENGINE
        //   └─ metric.insight was generated by rulesEngine.js
        //   └─ Examples:
        //      - "Code reaches production quickly."
        //      - "Tasks are taking too long to complete."
        //      - "Quality issues are slipping into production."
        //   └─ This explains the metric to the user
      </div>
      
      <div className="action-box">
        <strong>🚀 Suggested Action (The What Next):</strong>
        <p>{metric.action}</p>
        // ↑ DISPLAY ACTION FROM RULES ENGINE
        //   └─ metric.action was generated by rulesEngine.js
        //   └─ Examples:
        //      - "Keep it up."
        //      - "Break Jira tickets into smaller 1-2 day tasks."
        //      - "Add automated unit tests before requesting a review."
        //   └─ This tells the user what to do next
      </div>
    </div>
  );
}

export default MetricDetails;
// ═══════════════════════════════════════════════════════════
```

---

## Quick Reference: Where Logic Lives

### Rule Comparisons
```javascript
// Location: src/rulesEngine.js, lines 13-60

// RULE #1: Lead Time (Line 13)
const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;  // 3 <= 7?

// RULE #2: Cycle Time (Line 26)
const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;  // 8 <= 4?

// RULE #3: Bug Rate (Line 39)
const isBugRateGood = rawData.bugRate <= TARGETS.maxBugRate;  // 15 <= 10?

// RULE #4: Deploy Frequency (Line 52, NOTE: >= instead of <=)
const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;  // 4 >= 2?

// RULE #5: PR Throughput (Line 59, NOTE: >= instead of <=)
const isPrsGood = rawData.prs >= TARGETS.minPrs;  // 5 >= 3?
```

### Status Determination
```javascript
// Location: src/rulesEngine.js, lines 14-22, 27-35, 40-48, 53-61, etc.

// Pattern for all metrics:
status: isRuleGood ? "good" : "bad",
// └─ If rule comparison is TRUE → "good"
// └─ If rule comparison is FALSE → "bad"
```

### Conditional Rendering
```javascript
// Location: src/components/MetricCard.jsx, line 11
{metric.status === 'good' ? '✅ On Track' : '⚠️ Needs Attention'}

// Location: src/components/MetricCard.jsx, line 4
const cardClasses = `metric-card ${metric.status}`;
```

### Data Flow
```
data.json (raw values)
    ↓
rulesEngine.js (applies rules, determines status)
    ↓
App.jsx (receives evaluated metrics, manages state)
    ↓
MetricCard.jsx (receives individual metric, renders card)
MetricDetails.jsx (receives selected metric, renders details)
```

---

## Summary: Where to Find Each Type of Logic

| Logic Type | File | Lines | Purpose |
|-----------|------|-------|---------|
| Raw Data | data.json | All | Source of truth |
| Standards/Targets | rulesEngine.js | 3-9 | Industry benchmarks |
| Rule #1 Evaluation | rulesEngine.js | 13-22 | Lead Time comparison |
| Rule #2 Evaluation | rulesEngine.js | 26-35 | Cycle Time comparison |
| Rule #3 Evaluation | rulesEngine.js | 39-48 | Bug Rate comparison |
| Rule #4 Evaluation | rulesEngine.js | 52-61 | Deploy Frequency comparison |
| Rule #5 Evaluation | rulesEngine.js | 65-74 | PR Throughput comparison |
| Status Display | MetricCard.jsx | 4, 11 | CSS class & emoji |
| UI State | App.jsx | 10 | Track selected card |
| Data Orchestration | App.jsx | 8 | Call rules engine |

**All business logic → rulesEngine.js**  
**All presentation → Components**  
**Orchestration → App.jsx**

