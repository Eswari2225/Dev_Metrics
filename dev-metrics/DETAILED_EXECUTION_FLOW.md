# 📋 Detailed Code Execution & Rule Logic Reference

## Quick Navigation
- [Complete Execution Flow](#complete-execution-flow)
- [Rule Logic Breakdown](#rule-logic-breakdown)
- [Where Each Logic Lives](#where-each-logic-lives)
- [Code Annotations by Layer](#code-annotations-by-layer)
- [Adding Custom Rules](#adding-custom-rules)

---

## Complete Execution Flow

### Step-by-Step Walkthrough

```
┌─────────────────────────────────────────────────────────────────┐
│  USER ACTION: Opens browser at localhost:5173                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1. Browser loads main.jsx                                      │
│     └─> Renders: <App />                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  2. App.jsx executes                                            │
│                                                                  │
│     function App() {                                            │
│       const metricsData = evaluateDeveloperMetrics();           │
│       // ↓ CONTROL PASSES TO RULES ENGINE                      │
│     }                                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  3. rulesEngine.js executes                                     │
│     └─> evaluateDeveloperMetrics() starts                       │
│                                                                  │
│     FIRST ACTION: Import raw data                              │
│     import rawData from './data.json';                          │
│     ├─ rawData.leadTime = 3                                    │
│     ├─ rawData.cycleTime = 8                                   │
│     ├─ rawData.bugRate = 15                                    │
│     ├─ rawData.deploys = 4                                     │
│     └─ rawData.prs = 5                                         │
│                                                                  │
│     SECOND ACTION: Define targets (industry standards)          │
│     const TARGETS = {                                           │
│       maxLeadTime: 7,    // DORA: Good teams < 7 days         │
│       maxCycleTime: 4,   // Kanban: Good teams < 4 days       │
│       maxBugRate: 10,    // Industry: < 10% defect rate       │
│       minDeploys: 2,     // DORA: Deploy 2+ times/week        │
│       minPrs: 3          // GitHub: Good code review rate     │
│     };                                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  4. Evaluate 5 Rules                                            │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║ RULE #1: Lead Time                                        ║  │
│  ╠═══════════════════════════════════════════════════════════╣  │
│  ║                                                            ║  │
│  ║ COMPARE: rawData.leadTime (3) vs TARGETS.maxLeadTime (7) ║  │
│  ║ LOGIC:   3 <= 7  ?                                       ║  │
│  ║ RESULT:  TRUE → status = "good"                          ║  │
│  ║                                                            ║  │
│  ║ OUTPUT:                                                    ║  │
│  ║ {                                                          ║  │
│  ║   id: 1,                                                  ║  │
│  ║   title: "Lead Time",                                     ║  │
│  ║   value: "3 Days",                                        ║  │
│  ║   status: "good",  ← Determined by rule                  ║  │
│  ║   insight: "Code reaches production quickly.",            ║  │
│  ║   action: "Keep it up."                                   ║  │
│  ║ }                                                          ║  │
│  ║                                                            ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║ RULE #2: Cycle Time                                      ║  │
│  ╠═══════════════════════════════════════════════════════════╣  │
│  ║                                                            ║  │
│  ║ COMPARE: rawData.cycleTime (8) vs TARGETS.maxCycleTime (4)║  │
│  ║ LOGIC:   8 <= 4  ?                                       ║  │
│  ║ RESULT:  FALSE → status = "bad"                          ║  │
│  ║                                                            ║  │
│  ║ OUTPUT:                                                    ║  │
│  ║ {                                                          ║  │
│  ║   id: 2,                                                  ║  │
│  ║   title: "Cycle Time",                                    ║  │
│  ║   value: "8 Days",                                        ║  │
│  ║   status: "bad",   ← Determined by rule                  ║  │
│  ║   insight: "Tasks are taking too long to complete.",      ║  │
│  ║   action: "Break Jira tickets into smaller 1-2 day tasks."║  │
│  ║ }                                                          ║  │
│  ║                                                            ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║ RULE #3: Bug Rate                                         ║  │
│  ╠═══════════════════════════════════════════════════════════╣  │
│  ║                                                            ║  │
│  ║ COMPARE: rawData.bugRate (15) vs TARGETS.maxBugRate (10)  ║  │
│  ║ LOGIC:   15 <= 10  ?                                      ║  │
│  ║ RESULT:  FALSE → status = "bad"                           ║  │
│  ║                                                            ║  │
│  ║ OUTPUT:                                                    ║  │
│  ║ {                                                          ║  │
│  ║   id: 3,                                                  ║  │
│  ║   title: "Bug Rate",                                      ║  │
│  ║   value: "15%",                                           ║  │
│  ║   status: "bad",   ← Determined by rule                  ║  │
│  ║   insight: "Quality issues are slipping into production.",║  │
│  ║   action: "Add automated unit tests before requesting..." ║  │
│  ║ }                                                          ║  │
│  ║                                                            ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║ RULE #4: Deploy Frequency (NOTE: >= instead of <=)        ║  │
│  ╠═══════════════════════════════════════════════════════════╣  │
│  ║                                                            ║  │
│  ║ COMPARE: rawData.deploys (4) vs TARGETS.minDeploys (2)    ║  │
│  ║ LOGIC:   4 >= 2  ?                                        ║  │
│  ║ RESULT:  TRUE → status = "good"                           ║  │
│  ║                                                            ║  │
│  ║ OUTPUT:                                                    ║  │
│  ║ {                                                          ║  │
│  ║   id: 4,                                                  ║  │
│  ║   title: "Deploy Frequency",                              ║  │
│  ║   value: "4/week",                                        ║  │
│  ║   status: "good",  ← Determined by rule                  ║  │
│  ║   insight: "You are deploying consistently.",             ║  │
│  ║   action: "Keep it up."                                   ║  │
│  ║ }                                                          ║  │
│  ║                                                            ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║ RULE #5: PR Throughput (NOTE: >= instead of <=)           ║  │
│  ╠═══════════════════════════════════════════════════════════╣  │
│  ║                                                            ║  │
│  ║ COMPARE: rawData.prs (5) vs TARGETS.minPrs (3)            ║  │
│  ║ LOGIC:   5 >= 3  ?                                        ║  │
│  ║ RESULT:  TRUE → status = "good"                           ║  │
│  ║                                                            ║  │
│  ║ OUTPUT:                                                    ║  │
│  ║ {                                                          ║  │
│  ║   id: 5,                                                  ║  │
│  ║   title: "PR Throughput",                                 ║  │
│  ║   value: "5 PRs",                                         ║  │
│  ║   status: "good",  ← Determined by rule                  ║  │
│  ║   insight: "Healthy amount of code being merged.",        ║  │
│  ║   action: "Keep it up."                                   ║  │
│  ║ }                                                          ║  │
│  ║                                                            ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  5. Rules Engine Returns Array                                 │
│                                                                  │
│  return metrics;  // Array of 5 evaluated metric objects        │
│                                                                  │
│  [                                                              │
│    { id: 1, title: "Lead Time", status: "good", ... },         │
│    { id: 2, title: "Cycle Time", status: "bad", ... },         │
│    { id: 3, title: "Bug Rate", status: "bad", ... },           │
│    { id: 4, title: "Deploy Frequency", status: "good", ... },  │
│    { id: 5, title: "PR Throughput", status: "good", ... }      │
│  ]                                                              │
│                                                                  │
│  CONTROL PASSES BACK TO App.jsx                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  6. App.jsx Stores Data & Renders                              │
│                                                                  │
│  const metricsData = [5 evaluated metrics];                     │
│                                                                  │
│  <div className="metrics-grid">                                │
│    {metricsData.map((metric) => (                              │
│      <MetricCard                                                │
│        metric={metric}  ← Pass each evaluated metric           │
│        isSelected={selectedMetric?.id === metric.id}           │
│        onCardClick={handleMetricSelect}                        │
│      />                                                         │
│    ))}                                                          │
│  </div>                                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  7. MetricCard Renders                                          │
│                                                                  │
│  RECEIVES: metric = {                                           │
│    id: 1,                                                       │
│    title: "Lead Time",                                          │
│    value: "3 Days",                                             │
│    status: "good",  ← Used to determine styling                │
│    insight: "...",                                              │
│    action: "..."                                                │
│  }                                                              │
│                                                                  │
│  RENDERS:                                                       │
│  <div className="metric-card good">                            │
│    {/* CSS applies green background because status="good" */}  │
│    <h3>Lead Time</h3>                                           │
│    <p className="value">3 Days</p>                              │
│    <span className="status-badge">✅ On Track</span>           │
│  </div>                                                         │
│                                                                  │
│  RESULT: Green card with checkmark appears on dashboard        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  8. USER SEES Dashboard                                         │
│                                                                  │
│  ┌─────────────────────────────────┐                           │
│  │ Smart Developer Dashboard        │                          │
│  ├─────────────────────────────────┤                           │
│  │ ┌────────┐ ┌────────┐ ┌────────┐│                          │
│  │ │✅ Lead │ │⚠️ Cycle│ │⚠️ Bug  ││                          │
│  │ │Time    │ │Time    │ │Rate    ││                          │
│  │ │3 Days  │ │8 Days  │ │15%     ││                          │
│  │ └────────┘ └────────┘ └────────┘│                          │
│  │ ┌────────┐ ┌────────┐           │                          │
│  │ │✅Deploy│ │✅PR    │           │                          │
│  │ │Freq    │ │Through │           │                          │
│  │ │4/week  │ │5 PRs   │           │                          │
│  │ └────────┘ └────────┘           │                          │
│  └─────────────────────────────────┘                           │
│                                                                  │
│  Color Legend:                                                  │
│  🟢 Green = "good" status  ✅ On Track                          │
│  🔴 Red = "bad" status    ⚠️ Needs Attention                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  9. USER CLICKS "Cycle Time" Card                               │
│                                                                  │
│  onClick triggered → onCardClick(metric)                       │
│  setSelectedMetric(metric)  ← Updates state                    │
│  App re-renders                                                 │
│                                                                  │
│  <MetricDetails metric={selectedMetric} />                     │
│  Now receives the Cycle Time metric                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  10. MetricDetails Panel Shows                                  │
│                                                                  │
│  RECEIVES: metric = {                                           │
│    id: 2,                                                       │
│    title: "Cycle Time",                                         │
│    value: "8 Days",                                             │
│    status: "bad",                                               │
│    insight: "Tasks are taking too long to complete.",           │
│    action: "Break Jira tickets into smaller 1-2 day tasks."    │
│  }                                                              │
│                                                                  │
│  RENDERS:                                                       │
│  ┌────────────────────────────────────┐                        │
│  │ Investigating: Cycle Time           │                        │
│  │                                     │                        │
│  │ 🧠 Insight (The Why):              │                        │
│  │ Tasks are taking too long to       │                        │
│  │ complete.                          │                        │
│  │                                     │                        │
│  │ 🚀 Suggested Action (The What Next):│                        │
│  │ Break Jira tickets into smaller    │                        │
│  │ 1-2 day tasks.                     │                        │
│  └────────────────────────────────────┘                        │
│                                                                  │
│  USER LEARNS: Why is this bad? How to fix it?                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Rule Logic Breakdown

### Understanding Each Rule

#### RULE #1: Lead Time
```javascript
// WHAT IS IT?
// How many days from first commit to code reaching production?
// Goal: Fast feedback loop

// RULE DEFINITION
const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
//                     ↑ Actual value        ↑ Industry standard
//                     3 days                 7 days
//                     3 <= 7? YES → "good"

// DECISION LOGIC
if (3 <= 7) {
  status = "good"
  insight = "Code reaches production quickly."
  action = "Keep it up."
} else {
  status = "bad"
  insight = "Code is sitting unreleased for too long."
  action = "Review PRs faster to unblock releases."
}

// BUSINESS MEANING
// If lead time is low: Code gets to users quickly (GOOD!)
// If lead time is high: Code waits in review/deployment limbo (BAD!)
```

#### RULE #2: Cycle Time
```javascript
// WHAT IS IT?
// How many days from task creation to task completion?
// Goal: Keep tasks small & finishable

// RULE DEFINITION
const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
//                      ↑ Actual value        ↑ Industry standard
//                      8 days                 4 days
//                      8 <= 4? NO → "bad"

// DECISION LOGIC
if (8 <= 4) {
  status = "good"
  insight = "Tasks are completed at a healthy pace."
  action = "Keep it up."
} else {
  status = "bad"
  insight = "Tasks are taking too long to complete."
  action = "Break Jira tickets into smaller 1-2 day tasks."
}

// BUSINESS MEANING
// If cycle time is low: Work is being completed quickly (GOOD!)
// If cycle time is high: Tasks are too large/blocked (BAD!)

// WHY THIS MATTERS
// Large tasks = high risk of blocking
// Small tasks = quick feedback, easy to unblock
```

#### RULE #3: Bug Rate
```javascript
// WHAT IS IT?
// What percentage of deployed code has bugs?
// Goal: High quality releases

// RULE DEFINITION
const isBugRateGood = rawData.bugRate <= TARGETS.maxBugRate;
//                    ↑ Actual value        ↑ Industry standard
//                    15%                    10%
//                    15 <= 10? NO → "bad"

// DECISION LOGIC
if (15 <= 10) {
  status = "good"
  insight = "Your code is highly stable."
  action = "Keep it up."
} else {
  status = "bad"
  insight = "Quality issues are slipping into production."
  action = "Add automated unit tests before requesting a review."
}

// BUSINESS MEANING
// If bug rate is low: Code quality is good (GOOD!)
// If bug rate is high: Too many defects being released (BAD!)

// THE FIX
// - Write unit tests BEFORE committing
// - Run tests in CI/CD pipeline
// - Require peer review before merge
// - Add automated quality gates
```

#### RULE #4: Deploy Frequency
```javascript
// WHAT IS IT?
// How many times per week does code get deployed?
// Goal: Frequent, small releases

// RULE DEFINITION (NOTE: Uses >= instead of <=)
const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
//                    ↑ Actual value      ↑ Minimum standard
//                    4 times/week        2 times/week
//                    4 >= 2? YES → "good"

// DECISION LOGIC
if (4 >= 2) {
  status = "good"
  insight = "You are deploying consistently."
  action = "Keep it up."
} else {
  status = "bad"
  insight = "You are not releasing code often enough."
  action = "Push smaller, safer updates to production."
}

// BUSINESS MEANING
// High deploy frequency = Low risk per deployment (GOOD!)
// Low deploy frequency = Large batches, high risk (BAD!)

// WHY THIS MATTERS
// Deploying once a month = 1 month of risky changes
// Deploying daily = 1 day of risky changes
// Smaller batches = easier to debug if something breaks
```

#### RULE #5: PR Throughput
```javascript
// WHAT IS IT?
// How many PRs are merged per week?
// Goal: Continuous code flow

// RULE DEFINITION (NOTE: Uses >= instead of <=)
const isPrsGood = rawData.prs >= TARGETS.minPrs;
//                ↑ Actual value  ↑ Minimum standard
//                5 PRs/week      3 PRs/week
//                5 >= 3? YES → "good"

// DECISION LOGIC
if (5 >= 3) {
  status = "good"
  insight = "Healthy amount of code being merged."
  action = "Keep it up."
} else {
  status = "bad"
  insight = "Very little code is being merged."
  action = "Focus on finishing current tasks before starting new ones."
}

// BUSINESS MEANING
// High PR throughput = Code flowing smoothly (GOOD!)
// Low PR throughput = Code stuck in review or developers blocked (BAD!)

// INSIGHT
// If merging only 1-2 PRs/week → context switching, waiting time
// If merging 5+ PRs/week → smooth workflow, good momentum
```

### Comparison Operators Used

```javascript
// MAXIMUM-TYPE RULES (Lower is better)
// Use: <=  (must be less than or equal to target)

const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
const isBugRateGood = rawData.bugRate <= TARGETS.maxBugRate;

// MINIMUM-TYPE RULES (Higher is better)
// Use: >=  (must be greater than or equal to target)

const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
const isPrsGood = rawData.prs >= TARGETS.minPrs;
```

---

## Where Each Logic Lives

### Summary Table

| Logic Type | Location | File | Purpose |
|------------|----------|------|---------|
| **Raw Data** | Data Layer | `src/data.json` | Unevaluated metrics |
| **Standards** | Logic Layer | `src/rulesEngine.js` (line ~3-9) | TARGETS constant |
| **Rule Logic** | Logic Layer | `src/rulesEngine.js` (line ~11-60) | Comparisons & decisions |
| **UI State** | UI Layer | `src/App.jsx` (line ~8) | selectedMetric state |
| **Presentation** | UI Layer | `src/components/MetricCard.jsx` | Card rendering |
| **Detail Display** | UI Layer | `src/components/MetricDetails.jsx` | Insight & action display |

### Specific Line References

#### In `src/rulesEngine.js`:

```javascript
Line 1:  import rawData from './data.json';
         ↑ Fetches raw data from data layer

Line 3-9: const TARGETS = { ... }
          ↑ Industry standards (the "ideal" values)

Line 11:  export function evaluateDeveloperMetrics() {
          ↑ Main function that applies all rules

Line 13:  const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
          ↑ RULE #1: Compare actual vs target

Line 14-22: metrics.push({ ... })
            ↑ Build metric object with rule result

Line 26:  const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
          ↑ RULE #2: Similar pattern

Line 40:  const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
          ↑ RULE #4: Different operator (>=) for "minimum" rules

Line 63:  return metrics;
          ↑ Return array of all evaluated metrics
```

#### In `src/App.jsx`:

```javascript
Line 5:   import { evaluateDeveloperMetrics } from './rulesEngine';
          ↑ Import the rules engine function

Line 9:   const metricsData = evaluateDeveloperMetrics();
          ↑ Call rules engine to get evaluated metrics

Line 10:  const [selectedMetric, setSelectedMetric] = useState(null);
          ↑ UI state: which card user clicked

Line 27:  {metricsData.map((metric) => (
          ↑ Iterate over evaluated metrics

Line 28:  <MetricCard metric={metric} />
          ↑ Pass each metric to card component
```

#### In `src/components/MetricCard.jsx`:

```javascript
Line 4:   const cardClasses = `metric-card ${metric.status}`;
          ↑ Use metric.status (from rules engine) for styling

Line 11:  {metric.status === 'good' ? '✅ On Track' : '⚠️ Needs Attention'}
          ↑ Conditional display based on rule result
```

---

## Code Annotations by Layer

### DATA LAYER: src/data.json

```json
{
  "leadTime": 3,        // Raw value (days) - no logic
  "cycleTime": 8,       // Raw value (days) - no logic
  "bugRate": 15,        // Raw value (%) - no logic
  "deploys": 4,         // Raw value (per week) - no logic
  "prs": 5              // Raw value (per week) - no logic
}
// ↑ This is the SOURCE OF TRUTH
// ↑ All logic layers will evaluate these numbers
// ↑ UI layer will never directly access this - only through rules engine
```

### LOGIC LAYER: src/rulesEngine.js

```javascript
// ════════════════════════════════════════════════════════════
// IMPORT RAW DATA FROM DATA LAYER
// ════════════════════════════════════════════════════════════
import rawData from './data.json';
// Result: {leadTime: 3, cycleTime: 8, bugRate: 15, deploys: 4, prs: 5}

// ════════════════════════════════════════════════════════════
// DEFINE INDUSTRY STANDARDS (Business Rules - Part 1)
// ════════════════════════════════════════════════════════════
const TARGETS = {
  // MAX = higher value is worse, target is LOWER
  maxLeadTime: 7,        // DORA metrics: https://dora.dev
  maxCycleTime: 4,       // Kanban best practices
  maxBugRate: 10,        // Industry standard for production quality
  
  // MIN = higher value is better, target is HIGHER
  minDeploys: 2,         // DORA: Deploy at least 2x/week
  minPrs: 3              // GitHub workflow convention
};

// ════════════════════════════════════════════════════════════
// EXPORT EVALUATION FUNCTION
// ════════════════════════════════════════════════════════════
export function evaluateDeveloperMetrics() {
  const metrics = [];
  
  // ────────────────────────────────────────────────────────
  // RULE APPLICATION: Ternary operators for decision making
  // ────────────────────────────────────────────────────────
  
  // ┌─────────────────────────────────────────────────────┐
  // │ METRIC #1: LEAD TIME                                │
  // └─────────────────────────────────────────────────────┘
  
  // STEP 1: Apply the rule
  const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
  //                     └─ TRUE if good performance, FALSE if bad
  
  // STEP 2: Create metric object
  metrics.push({
    id: 1,
    
    // Display values (unchanged from raw data)
    title: "Lead Time",
    value: `${rawData.leadTime} Days`,
    
    // Rule result (binary: good or bad)
    status: isLeadTimeGood ? "good" : "bad",
    //       └─ If rule TRUE: "good", if rule FALSE: "bad"
    
    // Contextual explanation (based on rule result)
    insight: isLeadTimeGood 
      ? "Code reaches production quickly."              // Positive interpretation
      : "Code is sitting unreleased for too long.",    // Negative interpretation
    
    // Actionable recommendation (based on rule result)
    action: isLeadTimeGood 
      ? "Keep it up."                              // Encouragement
      : "Review PRs faster to unblock releases."   // Problem-solving advice
  });

  // ┌─────────────────────────────────────────────────────┐
  // │ METRIC #2: CYCLE TIME                               │
  // └─────────────────────────────────────────────────────┘
  
  const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
  //                      └─ Compare: 8 <= 4? → FALSE → status = "bad"
  
  metrics.push({
    id: 2,
    title: "Cycle Time",
    value: `${rawData.cycleTime} Days`,
    status: isCycleTimeGood ? "good" : "bad",      // Will be "bad"
    insight: isCycleTimeGood 
      ? "Tasks are completed at a healthy pace."
      : "Tasks are taking too long to complete.",  // Will display this
    action: isCycleTimeGood 
      ? "Keep it up."
      : "Break Jira tickets into smaller 1-2 day tasks."  // Will display this
  });

  // ┌─────────────────────────────────────────────────────┐
  // │ METRIC #3: BUG RATE                                 │
  // └─────────────────────────────────────────────────────┘
  
  const isBugRateGood = rawData.bugRate <= TARGETS.maxBugRate;
  //                    └─ Compare: 15 <= 10? → FALSE → status = "bad"
  
  metrics.push({
    id: 3,
    title: "Bug Rate",
    value: `${rawData.bugRate}%`,
    status: isBugRateGood ? "good" : "bad",        // Will be "bad"
    insight: isBugRateGood 
      ? "Your code is highly stable."
      : "Quality issues are slipping into production.",  // Will display this
    action: isBugRateGood 
      ? "Keep it up."
      : "Add automated unit tests before requesting a review."  // Will display this
  });

  // ┌─────────────────────────────────────────────────────┐
  // │ METRIC #4: DEPLOY FREQUENCY                         │
  // │ (Note: Uses >= because higher is better)            │
  // └─────────────────────────────────────────────────────┘
  
  const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
  //                    └─ Compare: 4 >= 2? → TRUE → status = "good"
  
  metrics.push({
    id: 4,
    title: "Deploy Frequency",
    value: `${rawData.deploys}/week`,
    status: isDeploysGood ? "good" : "bad",        // Will be "good"
    insight: isDeploysGood 
      ? "You are deploying consistently."          // Will display this
      : "You are not releasing code often enough.",
    action: isDeploysGood 
      ? "Keep it up."                              // Will display this
      : "Push smaller, safer updates to production."
  });

  // ┌─────────────────────────────────────────────────────┐
  // │ METRIC #5: PR THROUGHPUT                            │
  // │ (Note: Uses >= because higher is better)            │
  // └─────────────────────────────────────────────────────┘
  
  const isPrsGood = rawData.prs >= TARGETS.minPrs;
  //                └─ Compare: 5 >= 3? → TRUE → status = "good"
  
  metrics.push({
    id: 5,
    title: "PR Throughput",
    value: `${rawData.prs} PRs`,
    status: isPrsGood ? "good" : "bad",            // Will be "good"
    insight: isPrsGood 
      ? "Healthy amount of code being merged."     // Will display this
      : "Very little code is being merged.",
    action: isPrsGood 
      ? "Keep it up."                              // Will display this
      : "Focus on finishing current tasks before starting new ones."
  });

  // ────────────────────────────────────────────────────────
  // RETURN EVALUATED METRICS TO UI LAYER
  // ────────────────────────────────────────────────────────
  return metrics;
  // Returns:
  // [
  //   {id:1, title:"Lead Time", status:"good", ...},
  //   {id:2, title:"Cycle Time", status:"bad", ...},
  //   {id:3, title:"Bug Rate", status:"bad", ...},
  //   {id:4, title:"Deploy Frequency", status:"good", ...},
  //   {id:5, title:"PR Throughput", status:"good", ...}
  // ]
  // ↑ Each object has EVERYTHING the UI needs
  // ↑ No further logic needed in UI
}
```

### UI LAYER: src/App.jsx

```javascript
import { useState } from 'react';
import { evaluateDeveloperMetrics } from './rulesEngine';  // Import rules engine
import MetricCard from './components/MetricCard';
import MetricDetails from './components/MetricDetails';
import './App.css';

function App() {
  // ════════════════════════════════════════════════════════════
  // STEP 1: CALL RULES ENGINE TO GET EVALUATED METRICS
  // ════════════════════════════════════════════════════════════
  const metricsData = evaluateDeveloperMetrics();
  // Result:
  // [
  //   {id:1, title:"Lead Time", value:"3 Days", status:"good", insight:"...", action:"..."},
  //   {id:2, title:"Cycle Time", value:"8 Days", status:"bad", insight:"...", action:"..."},
  //   ...
  // ]
  // ↑ All decisions already made by rules engine
  // ↑ App.jsx only handles UI state, not business logic

  // ════════════════════════════════════════════════════════════
  // STEP 2: MANAGE UI STATE (which card is selected)
  // ════════════════════════════════════════════════════════════
  const [selectedMetric, setSelectedMetric] = useState(null);
  // Tracks: "Which card did the user click?"
  // Purpose: Show detailed view below the cards

  const handleMetricSelect = (metric) => {
    setSelectedMetric(metric);  // Update which card is "active"
  };

  // ════════════════════════════════════════════════════════════
  // STEP 3: RENDER UI
  // ════════════════════════════════════════════════════════════
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="header">
        <h1>Smart Developer Dashboard</h1>
        <p>Click on a metric to see insights and suggested actions.</p>
      </header>

      {/* Cards Grid - Display all evaluated metrics */}
      <div className="metrics-grid">
        {metricsData.map((metric) => (
          // For each evaluated metric, render a MetricCard
          <MetricCard 
            key={metric.id}                    // React key for list rendering
            metric={metric}                    // Pass entire evaluated metric object
            // metric = {
            //   id: 1,
            //   title: "Lead Time",
            //   value: "3 Days",
            //   status: "good",  ← This determines card color!
            //   insight: "Code reaches production quickly.",
            //   action: "Keep it up."
            // }
            
            isSelected={selectedMetric?.id === metric.id}
            // Check if this card is the one user selected
            // Used to highlight the active card
            
            onCardClick={handleMetricSelect}   // Pass click handler
          />
        ))}
      </div>

      {/* Details Panel - Shows when user clicks a card */}
      <MetricDetails metric={selectedMetric} />
      {/* Passes the selected metric (or null if none selected) */}
    </div>
  );
}

export default App;
```

### UI LAYER: src/components/MetricCard.jsx

```javascript
import React from 'react';

// ════════════════════════════════════════════════════════════
// DUMB COMPONENT: Only receives data and renders UI
// ════════════════════════════════════════════════════════════
function MetricCard({ metric, isSelected, onCardClick }) {
  // RECEIVES:
  // - metric: {id, title, value, status, insight, action}
  //           (fully evaluated by rules engine)
  // - isSelected: boolean (is this card highlighted?)
  // - onCardClick: function to call when clicked

  // ────────────────────────────────────────────────────────
  // BUILD CSS CLASSES BASED ON METRIC DATA
  // ────────────────────────────────────────────────────────
  const cardClasses = `metric-card ${metric.status} ${isSelected ? 'active' : ''}`;
  //                              └─ COMING FROM RULES ENGINE!
  // If metric.status === "good" → CSS class includes "good"
  //   → In CSS: .metric-card.good { background: green; }
  // If metric.status === "bad"  → CSS class includes "bad"
  //   → In CSS: .metric-card.bad { background: red; }

  return (
    // Card is clickable
    <div className={cardClasses} onClick={() => onCardClick(metric)}>
      {/* Display metric title (e.g., "Lead Time") */}
      <h3>{metric.title}</h3>

      {/* Display metric value (e.g., "3 Days") */}
      <p className="value">{metric.value}</p>

      {/* Conditional emoji based on status */}
      <span className="status-badge">
        {/* THIS IS THE ONLY LOGIC IN THIS COMPONENT */}
        {metric.status === 'good' ? '✅ On Track' : '⚠️ Needs Attention'}
        //                          └─ Determined by rules engine
      </span>
    </div>
  );
}

export default MetricCard;
// ↑ This component has ZERO business logic
// ↑ It's 100% presentation/display
// ↑ Could be used in mobile app, React Native, etc.
```

### UI LAYER: src/components/MetricDetails.jsx

```javascript
import React from 'react';

// ════════════════════════════════════════════════════════════
// DUMB COMPONENT: Only receives data and renders UI
// ════════════════════════════════════════════════════════════
function MetricDetails({ metric }) {
  // RECEIVES:
  // - metric: {id, title, value, status, insight, action}
  //           OR null if no card selected

  // If no metric selected, don't render anything
  if (!metric) return null;

  return (
    <div className="details-panel">
      {/* Show which metric is being investigated */}
      <h2>Investigating: {metric.title}</h2>

      {/* Insight section - explanation from rules engine */}
      <div className="insight-box">
        <strong>🧠 Insight (The Why):</strong>
        <p>{metric.insight}</p>
        {/* This comes directly from rules engine, no transformation */}
        {/* Examples:
            - "Code reaches production quickly."
            - "Tasks are taking too long to complete."
            - "Your code is highly stable."
        */}
      </div>

      {/* Action section - recommendation from rules engine */}
      <div className="action-box">
        <strong>🚀 Suggested Action (The What Next):</strong>
        <p>{metric.action}</p>
        {/* This comes directly from rules engine, no transformation */}
        {/* Examples:
            - "Keep it up."
            - "Break Jira tickets into smaller 1-2 day tasks."
            - "Add automated unit tests before requesting a review."
        */}
      </div>
    </div>
  );
}

export default MetricDetails;
// ↑ This component has ZERO business logic
// ↑ Just displays what the rules engine calculated
```

---

## Adding Custom Rules

### Template for Adding a New Rule

```javascript
// STEP 1: Add target to TARGETS constant (in rulesEngine.js)
const TARGETS = {
  maxLeadTime: 7,
  maxCycleTime: 4,
  maxBugRate: 10,
  minDeploys: 2,
  minPrs: 3,
  maxMttr: 60,         // ← NEW: Mean Time To Recovery
  maxCodeReviewTime: 8 // ← NEW: Code Review Time
};

// STEP 2: Add raw data field (in data.json)
{
  "leadTime": 3,
  "cycleTime": 8,
  "bugRate": 15,
  "deploys": 4,
  "prs": 5,
  "mttr": 45,              // ← NEW
  "codeReviewTime": 6      // ← NEW
}

// STEP 3: Add rule evaluation in evaluateDeveloperMetrics()
// NEW RULE: MTTR
const isMttrGood = rawData.mttr <= TARGETS.maxMttr;
metrics.push({
  id: 6,
  title: "MTTR",
  value: `${rawData.mttr} min`,
  status: isMttrGood ? "good" : "bad",
  insight: isMttrGood 
    ? "Your team recovers from incidents quickly."
    : "Incidents take too long to resolve.",
  action: isMttrGood 
    ? "Excellent incident response."
    : "Invest in runbooks and monitoring."
});

// NEW RULE: Code Review Time
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
    ? "Keep up the collaboration!"
    : "Set SLA for PR reviews (e.g., 8 hours)."
});

// STEP 4: Done! ✅
// - No changes needed in App.jsx
// - No changes needed in MetricCard.jsx
// - No changes needed in MetricDetails.jsx
// - MetricCard will automatically render the new metrics
```

### Rule Decision Tree

```
For each metric:

1. Define target standard
   ├─ MAX-type (lower is better): maxLeadTime, maxCycleTime, maxBugRate
   └─ MIN-type (higher is better): minDeploys, minPrs

2. Compare actual vs target
   ├─ IF (actual <= target) for MAX-type → GOOD
   ├─ IF (actual >= target) for MIN-type → GOOD
   └─ Otherwise → BAD

3. Generate conditional text
   ├─ IF status = "good" → positive insight + encouragement
   └─ IF status = "bad" → problem insight + solution

4. Add to metrics array
   └─ Returns array with all evaluated metrics
```

---

## Conclusion

Your 3-tier architecture ensures:

✅ **Data Layer** = Source of truth (raw values)  
✅ **Logic Layer** = Decision making (rules evaluation)  
✅ **UI Layer** = Pure presentation (display only)  

This separation means:
- 🧪 Rules are testable independently
- 📈 Adding metrics doesn't touch UI code
- 🔄 Logic is reusable across platforms
- 🛡️ Changes are isolated and safe

**Your architecture is enterprise-grade!** 🚀

