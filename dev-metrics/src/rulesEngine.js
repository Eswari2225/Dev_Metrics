import rawData from './data.json';

// DORA Industry Standards (The Rules)
const TARGETS = {
  maxLeadTime: 7,       
  maxCycleTime: 4,      
  maxBugRate: 10,       
  minDeploys: 2,        
  minPrs: 3             
};

export function evaluateDeveloperMetrics() {
  const metrics = [];

  // 1. Evaluate Lead Time
  const isLeadTimeGood = rawData.leadTime <= TARGETS.maxLeadTime;
  metrics.push({
    id: 1,
    title: "Lead Time",
    value: `${rawData.leadTime} Days`,
    status: isLeadTimeGood ? "good" : "bad",
    insight: isLeadTimeGood ? "Code reaches production quickly." : "Code is sitting unreleased for too long.",
    action: isLeadTimeGood ? "Keep it up." : "Review PRs faster to unblock releases."
  });

  // 2. Evaluate Cycle Time
  const isCycleTimeGood = rawData.cycleTime <= TARGETS.maxCycleTime;
  metrics.push({
    id: 2,
    title: "Cycle Time",
    value: `${rawData.cycleTime} Days`,
    status: isCycleTimeGood ? "good" : "bad",
    insight: isCycleTimeGood ? "Tasks are completed at a healthy pace." : "Tasks are taking too long to complete.",
    action: isCycleTimeGood ? "Keep it up." : "Break Jira tickets into smaller 1-2 day tasks."
  });

  // 3. Evaluate Bug Rate
  const isBugRateGood = rawData.bugRate <= TARGETS.maxBugRate;
  metrics.push({
    id: 3,
    title: "Bug Rate",
    value: `${rawData.bugRate}%`,
    status: isBugRateGood ? "good" : "bad",
    insight: isBugRateGood ? "Your code is highly stable." : "Quality issues are slipping into production.",
    action: isBugRateGood ? "Keep it up." : "Add automated unit tests before requesting a review."
  });

  // 4. Evaluate Deploy Frequency
  const isDeploysGood = rawData.deploys >= TARGETS.minDeploys;
  metrics.push({
    id: 4,
    title: "Deploy Frequency",
    value: `${rawData.deploys}/week`,
    status: isDeploysGood ? "good" : "bad",
    insight: isDeploysGood ? "You are deploying consistently." : "You are not releasing code often enough.",
    action: isDeploysGood ? "Keep it up." : "Push smaller, safer updates to production."
  });

  // 5. Evaluate PR Throughput
  const isPrsGood = rawData.prs >= TARGETS.minPrs;
  metrics.push({
    id: 5,
    title: "PR Throughput",
    value: `${rawData.prs} PRs`,
    status: isPrsGood ? "good" : "bad",
    insight: isPrsGood ? "Healthy amount of code being merged." : "Very little code is being merged.",
    action: isPrsGood ? "Keep it up." : "Focus on finishing current tasks before starting new ones."
  });

  return metrics;
}