# 🎨 Visual Architecture Reference Guide

## Complete Visual Documentation

---

## 1. Three-Layer Architecture Visual

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         USER INTERFACE (BROWSER)                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌──────────────────────────────────────────────────────────────────────────┐ ║
║  │  UI LAYER (React Components)                                             │ ║
║  │                                                                           │ ║
║  │  App.jsx (SMART COMPONENT)                                               │ ║
║  │  ├─ Calls: evaluateDeveloperMetrics()  ← Bridge to Logic Layer           │ ║
║  │  ├─ State: selectedMetric (tracks selected card)                         │ ║
║  │  └─ Renders:                                                             │ ║
║  │      ├─ MetricCard.jsx (DUMB) × 5                                        │ ║
║  │      │   ├─ Receives: metric object                                      │ ║
║  │      │   ├─ Uses: metric.status (from rules)                             │ ║
║  │      │   └─ Shows: colored card with emoji                              │ ║
║  │      └─ MetricDetails.jsx (DUMB)                                         │ ║
║  │          ├─ Receives: selected metric                                    │ ║
║  │          └─ Shows: insight + action (from rules)                         │ ║
║  │                                                                           │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                    ↓ Calls evaluateDeveloperMetrics()                        ║
║  ┌──────────────────────────────────────────────────────────────────────────┐ ║
║  │  LOGIC LAYER (rulesEngine.js)                                            │ ║
║  │                                                                           │ ║
║  │  TARGETS (Industry Standards)                                            │ ║
║  │  ├─ maxLeadTime: 7              (max-type: lower is better)              │ ║
║  │  ├─ maxCycleTime: 4             (max-type: lower is better)              │ ║
║  │  ├─ maxBugRate: 10              (max-type: lower is better)              │ ║
║  │  ├─ minDeploys: 2               (min-type: higher is better)             │ ║
║  │  └─ minPrs: 3                   (min-type: higher is better)             │ ║
║  │                                                                           │ ║
║  │  RULES (Apply Comparisons & Generate Insights)                           │ ║
║  │  ├─ Rule #1: leadTime <= 7? → {status, insight, action}                 │ ║
║  │  ├─ Rule #2: cycleTime <= 4? → {status, insight, action}                │ ║
║  │  ├─ Rule #3: bugRate <= 10? → {status, insight, action}                 │ ║
║  │  ├─ Rule #4: deploys >= 2? → {status, insight, action}                  │ ║
║  │  └─ Rule #5: prs >= 3? → {status, insight, action}                      │ ║
║  │                                                                           │ ║
║  │  RETURNS: Array of 5 evaluated metric objects                            │ ║
║  │  [                                                                        │ ║
║  │    {id:1, title:"Lead Time", value:"3 Days", status:"good", ...},        │ ║
║  │    {id:2, title:"Cycle Time", value:"8 Days", status:"bad", ...},        │ ║
║  │    {id:3, title:"Bug Rate", value:"15%", status:"bad", ...},             │ ║
║  │    {id:4, title:"Deploy Frequency", value:"4/week", status:"good", ...}, │ ║
║  │    {id:5, title:"PR Throughput", value:"5 PRs", status:"good", ...}      │ ║
║  │  ]                                                                        │ ║
║  │                                                                           │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                    ↓ Reads raw data                                          ║
║  ┌──────────────────────────────────────────────────────────────────────────┐ ║
║  │  DATA LAYER (data.json)                                                  │ ║
║  │                                                                           │ ║
║  │  {                                                                        │ ║
║  │    "leadTime": 3,     ← Raw metric (no logic)                            │ ║
║  │    "cycleTime": 8,    ← Raw metric (no logic)                            │ ║
║  │    "bugRate": 15,     ← Raw metric (no logic)                            │ ║
║  │    "deploys": 4,      ← Raw metric (no logic)                            │ ║
║  │    "prs": 5           ← Raw metric (no logic)                            │ ║
║  │  }                                                                        │ ║
║  │                                                                           │ ║
║  │  (Simulates backend API response)                                        │ ║
║  │                                                                           │ ║
║  └──────────────────────────────────────────────────────────────────────────┘ ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Rule Logic Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              RULE EVALUATION PROCESS (for each metric)           │
└─────────────────────────────────────────────────────────────────┘

START: Rule Evaluation
│
├─ STEP 1: Get raw value from data.json
│  │
│  ├─ Example for Lead Time: rawData.leadTime = 3
│  └─ Example for Cycle Time: rawData.cycleTime = 8
│
├─ STEP 2: Get target standard from TARGETS
│  │
│  ├─ Example for Lead Time: TARGETS.maxLeadTime = 7
│  └─ Example for Cycle Time: TARGETS.maxCycleTime = 4
│
├─ STEP 3: Apply comparison rule
│  │
│  ├─ For "MAX-type" metrics (lower is better):
│  │  └─ Comparison: actual <= target?
│  │     ├─ Lead Time: 3 <= 7? → YES (TRUE) → status = "good"
│  │     └─ Cycle Time: 8 <= 4? → NO (FALSE) → status = "bad"
│  │
│  └─ For "MIN-type" metrics (higher is better):
│     └─ Comparison: actual >= target?
│        ├─ Deploy Frequency: 4 >= 2? → YES (TRUE) → status = "good"
│        └─ PR Throughput: 5 >= 3? → YES (TRUE) → status = "good"
│
├─ STEP 4: Generate conditional content based on status
│  │
│  └─ IF status = "good":
│     ├─ insight = positive message
│     └─ action = encouragement
│     
│  └─ IF status = "bad":
│     ├─ insight = problem explanation
│     └─ action = solution suggestion
│
├─ STEP 5: Build metric object
│  │
│  └─ {
│       id: <unique number>,
│       title: "<metric name>",
│       value: "<formatted value>",
│       status: "good" | "bad",  ← Determined by rule
│       insight: "<explanation>",
│       action: "<recommendation>"
│     }
│
└─ END: Add to metrics array, return to UI

```

---

## 3. Comparison Operator Reference

```
┌─────────────────────────────────────────────────────────────────┐
│         MAX-TYPE RULES (Lower = Better Performance)             │
│         Use operator: <=                                         │
└─────────────────────────────────────────────────────────────────┘

RULE #1: Lead Time
┌─────────────────────────────────────────┐
│ Actual:  3 days     (from data.json)    │
│ Target:  7 days     (DORA standard)     │
│ Logic:   3 <= 7? → TRUE → "good"        │
│ Message: "Code reaches production       │
│          quickly. Keep it up!"          │
└─────────────────────────────────────────┘

RULE #2: Cycle Time
┌─────────────────────────────────────────┐
│ Actual:  8 days     (from data.json)    │
│ Target:  4 days     (Kanban standard)   │
│ Logic:   8 <= 4? → FALSE → "bad"        │
│ Message: "Tasks are taking too long.    │
│          Break Jira tickets into        │
│          smaller 1-2 day tasks."        │
└─────────────────────────────────────────┘

RULE #3: Bug Rate
┌─────────────────────────────────────────┐
│ Actual:  15%        (from data.json)    │
│ Target:  10%        (Industry standard) │
│ Logic:   15 <= 10? → FALSE → "bad"      │
│ Message: "Quality issues are slipping   │
│          into production. Add unit      │
│          tests before review."          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│         MIN-TYPE RULES (Higher = Better Performance)            │
│         Use operator: >=                                         │
└─────────────────────────────────────────────────────────────────┘

RULE #4: Deploy Frequency
┌─────────────────────────────────────────┐
│ Actual:  4/week     (from data.json)    │
│ Target:  2/week     (DORA standard)     │
│ Logic:   4 >= 2? → TRUE → "good"        │
│ Message: "You are deploying             │
│          consistently. Keep it up!"     │
└─────────────────────────────────────────┘

RULE #5: PR Throughput
┌─────────────────────────────────────────┐
│ Actual:  5 PRs      (from data.json)    │
│ Target:  3 PRs      (GitHub standard)   │
│ Logic:   5 >= 3? → TRUE → "good"        │
│ Message: "Healthy amount of code        │
│          being merged. Keep it up!"     │
└─────────────────────────────────────────┘
```

---

## 4. Component Data Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT COMMUNICATION MAP                              │
└────────────────────────────────────────────────────────────────────────────┘

DATA SOURCE (rulesEngine.js)
│
└─ evaluateDeveloperMetrics() returns:
   │
   └─ metricsData = [
      │
      ├─ {id:1, title:"Lead Time", status:"good", insight:"...", action:"..."}
      ├─ {id:2, title:"Cycle Time", status:"bad", insight:"...", action:"..."}
      ├─ {id:3, title:"Bug Rate", status:"bad", insight:"...", action:"..."}
      ├─ {id:4, title:"Deploy Frequency", status:"good", insight:"...", action:"..."}
      └─ {id:5, title:"PR Throughput", status:"good", insight:"...", action:"..."}
   ]

APP COMPONENT (App.jsx)
│
├─ Receives: metricsData from rules engine
│
├─ State: selectedMetric = null (initially)
│
├─ Passes to MetricCard #1-5:
│  │
│  ├─ MetricCard #1 (Lead Time)
│  │  ├─ Props: metric={id:1, status:"good", title:"Lead Time", ...}
│  │  ├─ Props: isSelected={false}
│  │  └─ Props: onCardClick={handleMetricSelect}
│  │     │
│  │     ├─ When clicked:
│  │     │  ├─ handleMetricSelect(metric)
│  │     │  ├─ setSelectedMetric(metric)
│  │     │  └─ App re-renders
│  │     │
│  │     └─ Renders: <div className="metric-card good">...</div>
│  │        └─ CSS: .metric-card.good { background: green; }
│  │
│  └─ MetricCard #2 (Cycle Time)
│     ├─ Props: metric={id:2, status:"bad", title:"Cycle Time", ...}
│     ├─ Props: isSelected={true} ← User clicked this one
│     └─ Props: onCardClick={handleMetricSelect}
│        │
│        └─ Renders: <div className="metric-card bad active">...</div>
│           └─ CSS: .metric-card.bad { background: red; }
│           └─ CSS: .metric-card.active { box-shadow: bold; }
│
└─ Passes to MetricDetails:
   │
   └─ Props: metric={id:2, title:"Cycle Time", status:"bad", 
                     insight:"...", action:"..."}
      │
      └─ Renders: 
         ├─ <h2>Investigating: Cycle Time</h2>
         ├─ <p>Tasks are taking too long to complete.</p> (insight)
         └─ <p>Break Jira tickets into smaller 1-2 day tasks.</p> (action)
```

---

## 5. Status Determination Matrix

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    METRIC STATUS DETERMINATION                           │
└──────────────────────────────────────────────────────────────────────────┘

Metric              Value  Type  Target  Comparison  Result  Status  Color
─────────────────────────────────────────────────────────────────────────────
Lead Time           3      max   7       3 <= 7?     YES     good    🟢
Cycle Time          8      max   4       8 <= 4?     NO      bad     🔴
Bug Rate           15      max   10      15 <= 10?   NO      bad     🔴
Deploy Frequency   4       min   2       4 >= 2?     YES     good    🟢
PR Throughput      5       min   3       5 >= 3?     YES     good    🟢

─────────────────────────────────────────────────────────────────────────────
VISUAL DASHBOARD REPRESENTATION:
─────────────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│       Smart Developer Dashboard (User View)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │✅ Lead     │  │⚠️ Cycle    │  │⚠️ Bug      │  │✅ Deploy   │      │
│  │Time        │  │Time        │  │Rate        │  │Frequency   │      │
│  │3 Days      │  │8 Days      │  │15%         │  │4/week      │      │
│  │On Track    │  │Needs       │  │Needs       │  │On Track    │      │
│  │            │  │Attention   │  │Attention   │  │            │      │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│        🟢              🔴              🔴              🟢               │
│                                                                          │
│  ┌────────────┐                                                         │
│  │✅ PR       │                                                         │
│  │Throughput  │                                                         │
│  │5 PRs       │                                                         │
│  │On Track    │                                                         │
│  └────────────┘                                                         │
│        🟢                                                                │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  Details (click any card above):                                        │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  [Currently showing: Cycle Time (selected)]                            │
│                                                                          │
│  🧠 Insight (The Why):                                                 │
│  Tasks are taking too long to complete.                                │
│                                                                          │
│  🚀 Suggested Action (The What Next):                                  │
│  Break Jira tickets into smaller 1-2 day tasks.                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Code Location Reference Map

```
┌───────────────────────────────────────────────────────────────────┐
│  WHERE TO FIND SPECIFIC LOGIC                                     │
└───────────────────────────────────────────────────────────────────┘

FILE: src/data.json
├─ Lines: All (~7 lines total)
└─ Content: Raw metric values
   ├─ leadTime: 3
   ├─ cycleTime: 8
   ├─ bugRate: 15
   ├─ deploys: 4
   └─ prs: 5

FILE: src/rulesEngine.js
├─ Lines 1: Import raw data
│  └─ import rawData from './data.json';
│
├─ Lines 3-9: Define standards
│  └─ const TARGETS = { maxLeadTime: 7, maxCycleTime: 4, ... }
│
├─ Lines 11: Export function
│  └─ export function evaluateDeveloperMetrics() {
│
├─ Lines 13: Rule #1 comparison
│  └─ const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
│
├─ Lines 14-22: Rule #1 metric object
│  └─ metrics.push({ id: 1, status: isLeadTimeGood ? "good" : "bad", ... })
│
├─ Lines 26: Rule #2 comparison
│  └─ const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
│
├─ Lines 40: Rule #4 comparison (note: >= operator)
│  └─ const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
│
└─ Lines 63: Return evaluated metrics
   └─ return metrics;

FILE: src/App.jsx
├─ Lines 5: Import rules engine
│  └─ import { evaluateDeveloperMetrics } from './rulesEngine';
│
├─ Lines 8-9: Call rules engine
│  └─ const metricsData = evaluateDeveloperMetrics();
│
├─ Lines 10: Manage UI state
│  └─ const [selectedMetric, setSelectedMetric] = useState(null);
│
├─ Lines 12-14: Click handler
│  └─ const handleMetricSelect = (metric) => { setSelectedMetric(metric); };
│
├─ Lines 26-35: Map metrics to cards
│  └─ {metricsData.map((metric) => (<MetricCard metric={metric} />))}
│
└─ Lines 36: Pass selected metric to details
   └─ <MetricDetails metric={selectedMetric} />

FILE: src/components/MetricCard.jsx
├─ Lines 4: Build CSS classes
│  └─ const cardClasses = `metric-card ${metric.status}`;
│        (Uses metric.status from rules engine to determine color)
│
└─ Lines 11: Conditional emoji
   └─ {metric.status === 'good' ? '✅ On Track' : '⚠️ Needs Attention'}

FILE: src/components/MetricDetails.jsx
├─ Lines 5: Handle no selection
│  └─ if (!metric) return null;
│
├─ Lines 8: Display insight from rules engine
│  └─ <p>{metric.insight}</p>
│
└─ Lines 13: Display action from rules engine
   └─ <p>{metric.action}</p>
```

---

## 7. Scalability Example: Adding "MTTR"

```
┌──────────────────────────────────────────────────────────────────┐
│  ADDING NEW METRIC: MTTR (Mean Time To Recovery)                │
└──────────────────────────────────────────────────────────────────┘

STEP 1: Update data.json (add raw value)
┌──────────────────────────────────────────┐
│ {                                        │
│   "leadTime": 3,                        │
│   "cycleTime": 8,                       │
│   "bugRate": 15,                        │
│   "deploys": 4,                         │
│   "prs": 5,                             │
│   "mttr": 45          ← NEW LINE        │
│ }                                        │
└──────────────────────────────────────────┘

STEP 2: Update rulesEngine.js (add target)
┌──────────────────────────────────────────┐
│ const TARGETS = {                       │
│   maxLeadTime: 7,                       │
│   maxCycleTime: 4,                      │
│   maxBugRate: 10,                       │
│   minDeploys: 2,                        │
│   minPrs: 3,                            │
│   maxMttr: 60          ← NEW LINE       │
│ };                                       │
└──────────────────────────────────────────┘

STEP 3: Update rulesEngine.js (add rule)
┌──────────────────────────────────────────┐
│ const isMttrGood =                      │
│   rawData.mttr <= TARGETS.maxMttr;      │
│                                         │
│ metrics.push({                          │
│   id: 6,               ← NEW ID         │
│   title: "MTTR",                        │
│   value: `${rawData.mttr} min`,         │
│   status: isMttrGood ? "good" : "bad",  │
│   insight: isMttrGood               │
│     ? "Your team recovers quickly."     │
│     : "Incidents take too long.",       │
│   action: isMttrGood                    │
│     ? "Keep it up."                     │
│     : "Improve runbooks."               │
│ });                                      │
└──────────────────────────────────────────┘

STEP 4: NO CHANGES NEEDED IN UI! ✅
┌──────────────────────────────────────────┐
│ ✓ App.jsx: UNCHANGED                   │
│   - metricData.map() will render 6     │
│     cards instead of 5                 │
│                                        │
│ ✓ MetricCard.jsx: UNCHANGED            │
│   - Works with any metric object       │
│                                        │
│ ✓ MetricDetails.jsx: UNCHANGED         │
│   - Works with any metric object       │
└──────────────────────────────────────────┘

RESULT: New metric automatically appears!
┌──────────────────────────────────────────┐
│ Dashboard now shows 6 cards:            │
│ 1. Lead Time        ✅ good             │
│ 2. Cycle Time       ⚠️  bad             │
│ 3. Bug Rate         ⚠️  bad             │
│ 4. Deploy Frequency ✅ good             │
│ 5. PR Throughput    ✅ good             │
│ 6. MTTR             ✅ good (NEW)       │
└──────────────────────────────────────────┘
```

---

## 8. Decision Tree for Rule Evaluation

```
START: evaluateDeveloperMetrics()
│
├─ For each metric in [leadTime, cycleTime, bugRate, deploys, prs]
│  │
│  ├─ DETERMINE METRIC TYPE
│  │  │
│  │  ├─ Is it a MAX-type? (lower is better)
│  │  │  ├─ Lead Time → YES
│  │  │  ├─ Cycle Time → YES
│  │  │  └─ Bug Rate → YES
│  │  │
│  │  └─ Is it a MIN-type? (higher is better)
│  │     ├─ Deploy Frequency → YES
│  │     └─ PR Throughput → YES
│  │
│  ├─ GET ACTUAL VALUE
│  │  └─ Get from rawData (data.json)
│  │
│  ├─ GET TARGET VALUE
│  │  └─ Get from TARGETS
│  │
│  ├─ COMPARE
│  │  │
│  │  ├─ If MAX-type: actual <= target?
│  │  │
│  │  └─ If MIN-type: actual >= target?
│  │
│  ├─ DETERMINE STATUS
│  │  ├─ If comparison TRUE → status = "good"
│  │  └─ If comparison FALSE → status = "bad"
│  │
│  ├─ GENERATE CONDITIONAL CONTENT
│  │  ├─ If status = "good"
│  │  │  ├─ insight = positive message
│  │  │  └─ action = encouragement
│  │  │
│  │  └─ If status = "bad"
│  │     ├─ insight = problem explanation
│  │     └─ action = solution suggestion
│  │
│  └─ CREATE METRIC OBJECT
│     └─ Push to metrics array
│
└─ END: Return metrics array with 5 objects
```

---

## Summary: Your Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│  WHAT EACH LAYER DOES                                           │
└─────────────────────────────────────────────────────────────────┘

DATA LAYER (data.json)
├─ What: Raw, unevaluated metrics
├─ Who controls: Backend API / Database
├─ Who uses: rulesEngine.js
└─ Replaces: API endpoint in the future

LOGIC LAYER (rulesEngine.js)
├─ What: Applies rules, determines status, generates insights
├─ Who controls: Product & Engineering teams
├─ Who uses: App.jsx
└─ Can be: Tested independently, reused in mobile/API, optimized

UI LAYER (App.jsx + Components)
├─ What: Displays what logic layer calculated
├─ Who controls: Design & Frontend teams
├─ Who uses: End users in browser
└─ Is: Pure presentation, no business logic

RESULT: Professional, scalable, maintainable architecture! 🚀
```

