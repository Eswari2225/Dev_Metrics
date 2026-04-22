# 🏗️ Dev-Metrics: Layered Architecture Deep Dive

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Layer 1: Data Layer](#layer-1-data-layer)
3. [Layer 2: Logic Layer (Rules Engine)](#layer-2-logic-layer-rules-engine)
4. [Layer 3: UI Layer](#layer-3-ui-layer)
5. [Data Flow Diagram](#data-flow-diagram)
6. [Scalability & Adding New Metrics](#scalability--adding-new-metrics)
7. [Key Design Patterns Used](#key-design-patterns-used)

---

## Architecture Overview

This project implements a **3-Tier Layered Architecture** to create a maintainable, scalable metrics dashboard:

```
┌─────────────────────────────────────────┐
│         UI LAYER (React)                │
│  ┌──────────────────────────────────┐  │
│  │  App.jsx (Main Container)        │  │
│  │  - Calls Rules Engine            │  │
│  │  - Renders MetricCard            │  │
│  │  - Renders MetricDetails         │  │
│  └──────────────────────────────────┘  │
│         ↓ Displays                      │
│  ┌────────────────────────────────────┐ │
│  │  Components/                       │ │
│  │  - MetricCard.jsx (Dumb Component) │ │
│  │  - MetricDetails.jsx (Dumb)        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↑ receives data
┌─────────────────────────────────────────┐
│       LOGIC LAYER (Rules Engine)        │
│  ┌──────────────────────────────────┐  │
│  │  rulesEngine.js                  │  │
│  │  - TARGETS (Industry Standards)  │  │
│  │  - evaluateDeveloperMetrics()    │  │
│  │  - Applies Business Rules        │  │
│  │  - Computes Status (good/bad)    │  │
│  │  - Generates Insights & Actions  │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↑ fetches raw data
┌─────────────────────────────────────────┐
│         DATA LAYER (API/Database)       │
│  ┌──────────────────────────────────┐  │
│  │  data.json (Mock Backend)        │  │
│  │  - leadTime: 3                   │  │
│  │  - cycleTime: 8                  │  │
│  │  - bugRate: 15                   │  │
│  │  - deploys: 4                    │  │
│  │  - prs: 5                        │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Why This Architecture?

| Benefit | How It Works |
|---------|------------|
| **Separation of Concerns** | Each layer has one responsibility |
| **Testability** | Rules can be tested independently |
| **Scalability** | Add new metrics without touching UI |
| **Maintainability** | Business logic isolated from presentation |
| **Reusability** | Rules Engine can be used by mobile app, backend, CLI |

---

## Layer 1: Data Layer

**Location:** `src/data.json`

### Purpose
Simulates a backend API response. Contains raw, unevaluated metrics data.

### Current Structure
```json
{
  "leadTime": 3,        // How many days from commit to production?
  "cycleTime": 8,       // How many days from task start to completion?
  "bugRate": 15,        // What % of deployed code has bugs?
  "deploys": 4,         // How many times per week do we deploy?
  "prs": 5              // How many PRs merged this week?
}
```

### Key Points
- ✅ **No business logic** - Just raw numbers
- ✅ **API-ready format** - Easy to replace with real backend
- ✅ **Mockable** - Allows testing without actual API

### Transition to Real Backend
```javascript
// BEFORE: Using mock data
import rawData from './data.json';

// AFTER: Using real API (future enhancement)
async function fetchMetricsData() {
  const response = await fetch('https://api.company.com/metrics');
  return await response.json();
}
```

**The data layer changes won't affect the Logic or UI layers!**

---

## Layer 2: Logic Layer (Rules Engine)

**Location:** `src/rulesEngine.js`

This is the **heart** of your scalable architecture. It's where all business intelligence lives.

### Architecture Pattern: Rule Evaluation Engine

```javascript
┌─────────────────────────────────────┐
│   Raw Data (data.json)              │
│   leadTime: 3, cycleTime: 8, ...    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   TARGETS (Industry Standards)      │
│   maxLeadTime: 7                    │
│   maxCycleTime: 4                   │
│   maxBugRate: 10                    │
│   minDeploys: 2                     │
│   minPrs: 3                         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Rules (IF/THEN Logic)             │
│   IF leadTime <= 7 THEN "good"      │
│   IF cycleTime <= 4 THEN "good"     │
│   IF bugRate <= 10 THEN "good"      │
│   IF deploys >= 2 THEN "good"       │
│   IF prs >= 3 THEN "good"           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Output (Evaluated Metrics)        │
│   {                                 │
│     id: 1,                          │
│     title: "Lead Time",             │
│     status: "good" | "bad",         │
│     insight: "...",                 │
│     action: "..."                   │
│   }                                 │
└─────────────────────────────────────┘
```

### Code Breakdown: Rule Application

```javascript
// STEP 1: Define Standards (Industry Best Practices)
const TARGETS = {
  maxLeadTime: 7,       // DORA Report: Good teams < 7 days
  maxCycleTime: 4,      // Kanban: Good teams < 4 days
  maxBugRate: 10,       // Industry: Aim for < 10% defect rate
  minDeploys: 2,        // DORA: Good teams deploy 2+ times/week
  minPrs: 3             // GitHub: Track code review velocity
};

// STEP 2: Evaluate Each Metric
export function evaluateDeveloperMetrics() {
  const metrics = [];

  // ============================================
  // RULE #1: Lead Time Evaluation
  // ============================================
  // LOGIC: Compare actual value against target
  const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
  
  metrics.push({
    id: 1,
    title: "Lead Time",
    value: `${rawData.leadTime} Days`,
    
    // STATUS: Determined by rule comparison
    status: isLeadTimeGood ? "good" : "bad",
    
    // INSIGHT: Human-readable explanation of what the metric means
    insight: isLeadTimeGood 
      ? "Code reaches production quickly."      // If rule passed
      : "Code is sitting unreleased for too long.",  // If rule failed
    
    // ACTION: Prescriptive next steps
    action: isLeadTimeGood 
      ? "Keep it up."
      : "Review PRs faster to unblock releases."
  });

  // ============================================
  // RULE #2: Cycle Time Evaluation
  // ============================================
  const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
  
  metrics.push({
    id: 2,
    title: "Cycle Time",
    value: `${rawData.cycleTime} Days`,
    status: isCycleTimeGood ? "good" : "bad",
    insight: isCycleTimeGood 
      ? "Tasks are completed at a healthy pace."
      : "Tasks are taking too long to complete.",
    action: isCycleTimeGood 
      ? "Keep it up."
      : "Break Jira tickets into smaller 1-2 day tasks."
  });

  // ============================================
  // RULE #3: Bug Rate Evaluation
  // ============================================
  const isBugRateGood = rawData.bugRate <= TARGETS.maxBugRate;
  
  metrics.push({
    id: 3,
    title: "Bug Rate",
    value: `${rawData.bugRate}%`,
    status: isBugRateGood ? "good" : "bad",
    insight: isBugRateGood 
      ? "Your code is highly stable."
      : "Quality issues are slipping into production.",
    action: isBugRateGood 
      ? "Keep it up."
      : "Add automated unit tests before requesting a review."
  });

  // ============================================
  // RULE #4: Deploy Frequency Evaluation
  // ============================================
  // NOTE: This rule uses >= (minimum) instead of <=
  const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
  
  metrics.push({
    id: 4,
    title: "Deploy Frequency",
    value: `${rawData.deploys}/week`,
    status: isDeploysGood ? "good" : "bad",
    insight: isDeploysGood 
      ? "You are deploying consistently."
      : "You are not releasing code often enough.",
    action: isDeploysGood 
      ? "Keep it up."
      : "Push smaller, safer updates to production."
  });

  // ============================================
  // RULE #5: PR Throughput Evaluation
  // ============================================
  const isPrsGood = rawData.prs >= TARGETS.minPrs;
  
  metrics.push({
    id: 5,
    title: "PR Throughput",
    value: `${rawData.prs} PRs`,
    status: isPrsGood ? "good" : "bad",
    insight: isPrsGood 
      ? "Healthy amount of code being merged."
      : "Very little code is being merged.",
    action: isPrsGood 
      ? "Keep it up."
      : "Focus on finishing current tasks before starting new ones."
  });

  return metrics;  // Array of 5 evaluated metrics
}
```

### Key Design Patterns Used Here

#### 1. **Rule Object Pattern** (Each metric = 1 rule object)
```javascript
{
  id: 1,                    // Unique identifier
  title: "Lead Time",       // Display name
  value: "3 Days",          // Raw metric display
  status: "good",           // Rule evaluation result
  insight: "...",           // Why (explanation)
  action: "..."             // What next (recommendation)
}
```

#### 2. **Comparison-Based Rules**
```javascript
// Maximum-type rules (value should be LOW)
const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;

// Minimum-type rules (value should be HIGH)
const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
```

#### 3. **Ternary Operator for Conditional Logic**
```javascript
// If condition is true → "good", else → "bad"
status: isLeadTimeGood ? "good" : "bad"

// Dynamic messages based on performance
insight: isLeadTimeGood 
  ? "Positive message (encouragement)"
  : "Negative message (problem identification)"
```

### Example: Rule Evaluation Flow

```
Input: data.json
  cycleTime: 8 days

Apply Rule #2:
  TARGETS.maxCycleTime = 4 days
  
Comparison:
  8 <= 4?  → FALSE
  
Verdict:
  status = "bad"
  insight = "Tasks are taking too long to complete."
  action = "Break Jira tickets into smaller 1-2 day tasks."

Output to UI:
  MetricCard shows: ⚠️ Needs Attention (red background)
  MetricDetails shows: Full insight and action
```

---

## Layer 3: UI Layer

**Location:** `src/App.jsx`, `src/components/`

The UI is **completely dumb** - it receives already-evaluated data from the Logic Layer.

### Component Hierarchy

```
App.jsx (Smart Component)
├── Calls: evaluateDeveloperMetrics()
├── State: selectedMetric
│
├── MetricCard.jsx (Dumb Component)
│   ├── Receives: metric, isSelected, onCardClick
│   ├── Renders: Card UI
│   └── Emits: Click event
│
└── MetricDetails.jsx (Dumb Component)
    ├── Receives: metric
    ├── Renders: Insight & Action
    └── No logic inside
```

### App.jsx Explained

```javascript
import { useState } from 'react';
import { evaluateDeveloperMetrics } from './rulesEngine';
import MetricCard from './components/MetricCard';
import MetricDetails from './components/MetricDetails';
import './App.css';

function App() {
  // ============================================
  // STEP 1: GET EVALUATED METRICS FROM LOGIC LAYER
  // ============================================
  // This is the ONLY place where we call the Rules Engine
  // Everything else is just presentation logic
  const metricsData = evaluateDeveloperMetrics();
  //                          ↑
  //    Returns array of 5 evaluated metrics with:
  //    - status (good/bad) ← determined by rules
  //    - insight (explanation)
  //    - action (recommendation)

  // ============================================
  // STEP 2: MANAGE UI STATE
  // ============================================
  // Track which metric card the user clicked
  const [selectedMetric, setSelectedMetric] = useState(null);

  const handleMetricSelect = (metric) => {
    setSelectedMetric(metric);  // Update UI state
  };

  // ============================================
  // STEP 3: RENDER UI
  // ============================================
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="header">
        <h1>Smart Developer Dashboard</h1>
        <p>Click on a metric to see insights and suggested actions.</p>
      </header>

      {/* Grid of Metric Cards */}
      <div className="metrics-grid">
        {/* Map over evaluated metrics */}
        {metricsData.map((metric) => (
          <MetricCard 
            key={metric.id}                    // React list key
            metric={metric}                    // Pass the evaluated data
            isSelected={selectedMetric?.id === metric.id}  // Highlight logic
            onCardClick={handleMetricSelect}   // Click handler
          />
        ))}
      </div>

      {/* Detail Panel - Shows when user clicks a card */}
      <MetricDetails metric={selectedMetric} />
    </div>
  );
}

export default App;
```

### MetricCard.jsx (Dumb Component)

```javascript
import React from 'react';

function MetricCard({ metric, isSelected, onCardClick }) {
  // ============================================
  // PURE PRESENTATION LOGIC ONLY
  // ============================================
  
  // CSS class names determined by props
  const cardClasses = `metric-card ${metric.status} ${isSelected ? 'active' : ''}`;
  //                              ↑ comes from logic layer
  //  CSS will show:
  //  - RED background if metric.status === "bad"
  //  - GREEN background if metric.status === "good"

  return (
    <div className={cardClasses} onClick={() => onCardClick(metric)}>
      <h3>{metric.title}</h3>          {/* e.g., "Lead Time" */}
      <p className="value">{metric.value}</p>  {/* e.g., "3 Days" */}
      
      <span className="status-badge">
        {/* Conditional emoji based on status */}
        {metric.status === 'good' ? '✅ On Track' : '⚠️ Needs Attention'}
      </span>
    </div>
  );
}

export default MetricCard;
```

### MetricDetails.jsx (Dumb Component)

```javascript
import React from 'react';

function MetricDetails({ metric }) {
  // If no metric selected, show nothing
  if (!metric) return null;

  return (
    <div className="details-panel">
      <h2>Investigating: {metric.title}</h2>
      
      {/* Insight Box - Explanation from Logic Layer */}
      <div className="insight-box">
        <strong>🧠 Insight (The Why):</strong>
        <p>{metric.insight}</p>
        {/* e.g., "Code reaches production quickly." */}
      </div>
      
      {/* Action Box - Recommendation from Logic Layer */}
      <div className="action-box">
        <strong>🚀 Suggested Action (The What Next):</strong>
        <p>{metric.action}</p>
        {/* e.g., "Keep it up." */}
      </div>
    </div>
  );
}

export default MetricDetails;
```

### Key Points About the UI Layer

| Aspect | Why |
|--------|-----|
| **No hardcoded insights** | Comes from rules engine |
| **No hardcoded actions** | Comes from rules engine |
| **No business logic** | Just receives & displays |
| **Fully testable** | Pass different props, test output |
| **Reusable components** | Can be used in mobile app, Slack bot, etc. |

---

## Data Flow Diagram

### Complete Request-Response Cycle

```
USER OPENS APP
      ↓
   App.jsx
      ↓
   Calls: evaluateDeveloperMetrics()
      ↓
   rulesEngine.js
      ├─ Imports: import rawData from './data.json'
      │
      ├─ Evaluates 5 Rules:
      │  ├─ Rule 1: leadTime <= 7? → status = "good"/"bad"
      │  ├─ Rule 2: cycleTime <= 4? → status = "good"/"bad"
      │  ├─ Rule 3: bugRate <= 10? → status = "good"/"bad"
      │  ├─ Rule 4: deploys >= 2? → status = "good"/"bad"
      │  └─ Rule 5: prs >= 3? → status = "good"/"bad"
      │
      └─ Returns: [metric1, metric2, metric3, metric4, metric5]
         (each metric = {id, title, value, status, insight, action})
      ↓
   App.jsx stores: const metricsData = [...]
      ↓
   Renders: <MetricCard metric={metric} />  ← 5 times
      ↓
   USER SEES: Dashboard with 5 colored cards
```

### When User Clicks a Card

```
User clicks MetricCard
      ↓
onCardClick(metric) triggered
      ↓
setSelectedMetric(metric)
      ↓
App re-renders
      ↓
<MetricDetails metric={selectedMetric} />
      ↓
USER SEES: Insight & Action panels
```

---

## Scalability & Adding New Metrics

### Scenario: Add "MTTR" (Mean Time to Recovery)

**WITHOUT a logic layer (old way):**
```javascript
// Would need to change UI components
// Would need to update every place that shows metrics
// Risk of inconsistency
```

**WITH a logic layer (your way):**

#### Step 1: Add to data.json
```json
{
  "leadTime": 3,
  "cycleTime": 8,
  "bugRate": 15,
  "deploys": 4,
  "prs": 5,
  "mttr": 45  // ← New metric (45 minutes)
}
```

#### Step 2: Add to TARGETS in rulesEngine.js
```javascript
const TARGETS = {
  maxLeadTime: 7,
  maxCycleTime: 4,
  maxBugRate: 10,
  minDeploys: 2,
  minPrs: 3,
  maxMttr: 60  // ← Add standard (industry: < 60 minutes)
};
```

#### Step 3: Add Rule in evaluateDeveloperMetrics()
```javascript
// NEW RULE: MTTR Evaluation
const isMttrGood = rawData.mttr <= TARGETS.maxMttr;

metrics.push({
  id: 6,  // New ID
  title: "MTTR (Mean Time to Recovery)",
  value: `${rawData.mttr} min`,
  status: isMttrGood ? "good" : "bad",
  insight: isMttrGood 
    ? "Your team recovers from incidents quickly."
    : "Incidents take too long to resolve.",
  action: isMttrGood 
    ? "Maintain your incident response process."
    : "Improve runbooks and alerting systems."
});
```

**That's it!** 🎉

- ✅ No changes to UI components
- ✅ No changes to CSS
- ✅ No changes to App.jsx
- ✅ MetricCard automatically renders the 6th card
- ✅ MetricDetails automatically shows the 6th metric's insight

### Another Example: Add "Code Review Time"

```javascript
// In TARGETS:
maxCodeReviewTime: 8,  // Hours

// In evaluateDeveloperMetrics():
const isCodeReviewGood = rawData.codeReviewTime <= TARGETS.maxCodeReviewTime;

metrics.push({
  id: 7,
  title: "Code Review Time",
  value: `${rawData.codeReviewTime} hours`,
  status: isCodeReviewGood ? "good" : "bad",
  insight: isCodeReviewGood 
    ? "Your team provides fast feedback on PRs."
    : "Slow code reviews are blocking deployment.",
  action: isCodeReviewGood 
    ? "Great collaboration!"
    : "Set SLA for PR reviews (e.g., 8 hours)."
});
```

**UI Layer doesn't need ANY changes!** The components are generic enough to handle any metric.

---

## Key Design Patterns Used

### 1. **Layered Architecture Pattern**
- **Benefit:** Each layer can be tested, modified, and scaled independently
- **Your app:** Data → Logic → UI

### 2. **Separation of Concerns**
- **Benefit:** Each file has one job
- **Your app:**
  - `data.json` = storage
  - `rulesEngine.js` = logic
  - `App.jsx` = orchestration
  - `MetricCard.jsx` = card display
  - `MetricDetails.jsx` = detail display

### 3. **Smart Component / Dumb Component Pattern**
- **Benefit:** Dumb components are easier to test and reuse
- **Your app:**
  - **Smart:** `App.jsx` (knows about business logic, state management)
  - **Dumb:** `MetricCard.jsx`, `MetricDetails.jsx` (only display what they receive)

### 4. **Rules Engine Pattern**
- **Benefit:** Business logic is centralized, easy to modify, doesn't affect UI
- **Your app:** `evaluateDeveloperMetrics()` in `rulesEngine.js`

### 5. **Factory Pattern** (implicit)
- **Benefit:** `evaluateDeveloperMetrics()` "manufactures" metric objects
- **Your app:** Each rule creates a metric object with consistent structure

### 6. **Ternary Operator for Conditional Logic**
```javascript
status: isLeadTimeGood ? "good" : "bad"
insight: isLeadTimeGood ? "positive" : "negative"
```
- **Benefit:** Concise, readable conditional assignment
- **Your app:** All rules use this pattern consistently

---

## Testing & Validation

### Test the Logic Layer (No UI needed)

```javascript
// test/rulesEngine.test.js (future)

import { evaluateDeveloperMetrics } from '../rulesEngine.js';

test('Lead time rule should mark as good when <= 7', () => {
  // Mock data
  const metricsData = evaluateDeveloperMetrics();
  const leadTimeMetric = metricsData[0];
  
  // This would pass because data.json has leadTime: 3
  expect(leadTimeMetric.status).toBe('good');
  expect(leadTimeMetric.insight).toContain('quickly');
});

test('Cycle time rule should mark as bad when > 4', () => {
  const metricsData = evaluateDeveloperMetrics();
  const cycleTimeMetric = metricsData[1];
  
  // This would pass because data.json has cycleTime: 8
  expect(cycleTimeMetric.status).toBe('bad');
  expect(cycleTimeMetric.action).toContain('smaller');
});
```

### Test the UI (No logic needed)

```javascript
// test/MetricCard.test.jsx (future)

import { render } from '@testing-library/react';
import MetricCard from '../components/MetricCard';

test('Card should show green when status is good', () => {
  const mockMetric = {
    id: 1,
    title: 'Lead Time',
    value: '3 Days',
    status: 'good',
    insight: '...',
    action: '...'
  };
  
  const { container } = render(
    <MetricCard metric={mockMetric} isSelected={false} onCardClick={() => {}} />
  );
  
  expect(container.querySelector('.metric-card')).toHaveClass('good');
});
```

---

## Migration Path: From Mock to Real API

### Current State (Mock Data)
```
data.json → rulesEngine.js → App.jsx → UI
```

### Future State (Real API)
```
API Endpoint → rulesEngine.js → App.jsx → UI
```

**No changes needed to rulesEngine or UI!**

```javascript
// In App.jsx or a custom hook (future enhancement)

async function fetchAndEvaluateMetrics() {
  try {
    // Fetch from real backend
    const response = await fetch('https://api.company.com/metrics');
    const rawData = await response.json();
    
    // Rules engine evaluates the same way
    return evaluateDeveloperMetrics(rawData);
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
  }
}
```

---

## Summary: Why This Architecture Matters

### Before (Without Layering)
```
UI Component
  ├─ Fetch API
  ├─ Compare with targets
  ├─ Determine status
  ├─ Generate insight
  ├─ Generate action
  └─ Render
  
Problems:
- Logic scattered across components
- Hard to test
- Difficult to reuse logic
- Changes to rules affect UI
```

### After (With Layering)
```
UI Layer (Pure presentation)
  ↓
Logic Layer (All business intelligence)
  ↓
Data Layer (Raw metrics)

Benefits:
✅ Logic is centralized & testable
✅ UI is dumb & reusable
✅ Adding metrics = only 3 lines of code
✅ Rules can be used by mobile, API, CLI
✅ Easy to refactor or optimize
✅ Professional software engineering
```

---

## File Map Reference

```
dev-metrics/
├── src/
│   ├── App.jsx
│   │   └── ORCHESTRATION: Calls rulesEngine, renders components
│   │
│   ├── rulesEngine.js
│   │   ├── TARGETS: Industry standards
│   │   └── evaluateDeveloperMetrics(): Core logic
│   │
│   ├── data.json
│   │   └── RAW DATA: Mock backend response
│   │
│   ├── components/
│   │   ├── MetricCard.jsx: Dumb component - displays card
│   │   └── MetricDetails.jsx: Dumb component - displays details
│   │
│   ├── App.css: Styling
│   └── main.jsx: Entry point
│
└── ARCHITECTURE_EXPLANATION.md ← You are here
```

---

## Next Steps

### Option 1: Enhanced Rules Engine
Add weighted scoring for critical metrics:
```javascript
const WEIGHTS = {
  leadTime: 0.2,
  cycleTime: 0.2,
  bugRate: 0.3,
  deploys: 0.15,
  prs: 0.15
};

function calculateHealthScore() {
  // Compute overall team health (0-100)
}
```

### Option 2: Rules Configuration
Move TARGETS to config file:
```javascript
// config/metricsTargets.js
export const TARGETS = {
  // Can be changed per team/organization
};
```

### Option 3: Advanced Rules
Add AND/OR logic:
```javascript
// Multiple conditions
const isHealthy = (leadTime <= 7) && (bugRate <= 10) && (deploys >= 2);
```

### Option 4: Historical Trending
Track metrics over time:
```javascript
{
  id: 1,
  title: "Lead Time",
  current: 3,
  previous: 5,
  trend: "improving",  // ↓ better
  status: "good"
}
```

---

## Conclusion

Your dev-metrics project demonstrates **professional software architecture**:

1. **Data Layer** = Source of truth (mock or real API)
2. **Logic Layer** = Business intelligence (rules & reasoning)
3. **UI Layer** = User experience (presentation only)

This separation makes your code:
- 🧪 **Testable** - Test rules without rendering
- 📈 **Scalable** - Add metrics without touching UI
- 🔄 **Reusable** - Logic works anywhere (mobile, API, CLI)
- 🛡️ **Maintainable** - Changes isolated to specific layers
- 🚀 **Professional** - Enterprise-grade software patterns

**Total time to add a new metric: ~2 minutes**

That's the power of layered architecture! 🏗️

