#!/usr/bin/env node
// Usage Tracking - PostToolUse Hook
// Captures tool usage and estimates token costs for statusline display

const fs = require('fs');
const path = require('path');

// Token estimation heuristics by tool type
// These are educated guesses based on typical usage patterns
const TOOL_ESTIMATES = {
  Read: { input: 2000, output: 500 },
  Write: { input: 1000, output: 3000 },
  Edit: { input: 2000, output: 2000 },
  Bash: { input: 1500, output: 1000 },
  Grep: { input: 1000, output: 800 },
  Glob: { input: 500, output: 300 },
  Task: { input: 5000, output: 1000 },  // Base agent spawning (overridden by agent type)
  WebFetch: { input: 2000, output: 3000 },
  WebSearch: { input: 1500, output: 2000 },
  AskUserQuestion: { input: 1000, output: 500 },
  Default: { input: 1500, output: 1000 }
};

// Agent-specific token estimates based on typical workload
// These agents run in separate contexts and can consume significant tokens
const AGENT_ESTIMATES = {
  // Planning & Research agents (high input for context, medium output)
  'gsd-planner': { input: 80000, output: 15000 },
  'gsd-phase-researcher': { input: 60000, output: 12000 },
  'gsd-plan-checker': { input: 40000, output: 8000 },
  'gsd-research-synthesizer': { input: 50000, output: 10000 },
  'gsd-roadmapper': { input: 70000, output: 12000 },

  // Execution agents (medium-high input, high output for code)
  'gsd-executor': { input: 60000, output: 20000 },
  'gsd-verifier': { input: 50000, output: 8000 },
  'gsd-debugger': { input: 55000, output: 15000 },

  // Codebase analysis agents (high input for large codebases)
  'gsd-codebase-mapper': { input: 100000, output: 15000 },
  'gsd-entity-generator': { input: 70000, output: 10000 },
  'gsd-integration-checker': { input: 60000, output: 10000 },

  // General purpose agents
  'Explore': { input: 50000, output: 8000 },
  'Plan': { input: 60000, output: 10000 },
  'Bash': { input: 30000, output: 5000 },
  'general-purpose': { input: 50000, output: 10000 },

  // Specialized domain agents
  'backend-developer': { input: 55000, output: 18000 },
  'frontend-developer': { input: 55000, output: 18000 },
  'fullstack-developer': { input: 60000, output: 20000 },
  'devops-engineer': { input: 50000, output: 12000 },
  'database-optimizer': { input: 45000, output: 10000 },

  // Default for unknown agents
  'default-agent': { input: 50000, output: 10000 }
};

// Read JSON from stdin (standard hook pattern)
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);

    // Skip certain tools that don't consume meaningful tokens
    const skipTools = ['TodoWrite'];
    if (skipTools.includes(data.tool_name)) {
      process.exit(0);
    }

    const planningDir = path.join(process.cwd(), '.planning');
    const usagePath = path.join(planningDir, 'usage.json');

    // Only track if .planning exists (GSD project)
    if (!fs.existsSync(planningDir)) {
      process.exit(0);
    }

    // Load existing usage data
    let usage = {
      sessions: [],
      recent_rate_limits: [],
      current_task: null
    };

    if (fs.existsSync(usagePath)) {
      try {
        usage = JSON.parse(fs.readFileSync(usagePath, 'utf8'));
      } catch (e) {
        // Invalid JSON, start fresh
      }
    }

    // Ensure sessions array exists
    if (!Array.isArray(usage.sessions)) {
      usage.sessions = [];
    }

    // Get current session (last one)
    let session = usage.sessions[usage.sessions.length - 1];

    // Create session if none exists
    if (!session) {
      session = {
        start_time: new Date().toISOString(),
        tasks: []
      };
      usage.sessions.push(session);
    }

    // Ensure tasks array exists
    if (!Array.isArray(session.tasks)) {
      session.tasks = [];
    }

    // Get model from data or use default
    let model = extractModel(data.model?.id || data.model?.display_name || 'sonnet');

    // Get token estimates for this tool
    const toolName = data.tool_name || 'Default';
    let estimates = TOOL_ESTIMATES[toolName] || TOOL_ESTIMATES.Default;

    // Special handling for Task tool (agent spawning)
    // Try to extract agent type and use agent-specific estimates
    let agentType = null;
    if (toolName === 'Task' && data.tool_input) {
      const agentInfo = extractAgentInfo(data.tool_input);
      if (agentInfo) {
        // Use agent-specific estimates
        estimates = agentInfo.estimates;

        // Use agent's requested model if specified
        if (agentInfo.model) {
          model = agentInfo.model;
        }

        // Store agent type for task metadata
        agentType = agentInfo.type;
      }
    }

    // Create task entry
    const task = {
      timestamp: new Date().toISOString(),
      tool_name: toolName,
      selected_model: model,
      input_tokens: estimates.input,
      output_tokens: estimates.output
    };

    // Add agent type if this was a Task tool
    if (agentType) {
      task.agent_type = agentType;
    }

    // Add current task tracking for "current task cost"
    usage.current_task = {
      tool_name: toolName,
      model: model,
      cost: calculateSingleTaskCost(model, estimates.input, estimates.output),
      timestamp: new Date().toISOString()
    };

    // Add agent type to current task tracking if available
    if (agentType) {
      usage.current_task.agent_type = agentType;
    }

    session.tasks.push(task);

    // Write updated usage
    fs.writeFileSync(usagePath, JSON.stringify(usage, null, 2));

    process.exit(0);
  } catch (error) {
    // Silent failure - never block Claude
    process.exit(0);
  }
});

/**
 * Extract agent information from Task tool input
 * Returns { type, estimates, model } or null
 */
function extractAgentInfo(toolInput) {
  if (!toolInput) return null;

  try {
    // Extract subagent_type (most reliable)
    let agentType = toolInput.subagent_type || toolInput.agent_type;

    // If no explicit agent type, try to infer from prompt
    if (!agentType && toolInput.prompt) {
      // Look for common agent patterns in prompt
      const prompt = toolInput.prompt.toLowerCase();
      if (prompt.includes('gsd-planner') || prompt.includes('create.*plan')) {
        agentType = 'gsd-planner';
      } else if (prompt.includes('gsd-executor') || prompt.includes('execute.*plan')) {
        agentType = 'gsd-executor';
      } else if (prompt.includes('gsd-verifier') || prompt.includes('verify.*phase')) {
        agentType = 'gsd-verifier';
      } else if (prompt.includes('researcher') || prompt.includes('research')) {
        agentType = 'gsd-phase-researcher';
      }
    }

    if (!agentType) return null;

    // Get agent-specific estimates or use default
    const estimates = AGENT_ESTIMATES[agentType] || AGENT_ESTIMATES['default-agent'];

    // Extract model if specified
    let model = null;
    if (toolInput.model) {
      model = extractModel(toolInput.model);
    }

    return {
      type: agentType,
      estimates: estimates,
      model: model
    };
  } catch (e) {
    // Failed to parse, return null
    return null;
  }
}

/**
 * Extract model name from various formats
 */
function extractModel(modelStr) {
  if (!modelStr) return 'sonnet';

  const lower = String(modelStr).toLowerCase();
  if (lower.includes('opus')) return 'opus';
  if (lower.includes('sonnet')) return 'sonnet';
  if (lower.includes('haiku')) return 'haiku';

  return 'sonnet'; // Default
}

/**
 * Calculate cost for a single task
 */
function calculateSingleTaskCost(model, inputTokens, outputTokens) {
  const pricing = {
    haiku: { input: 0.25 / 1000000, output: 1.25 / 1000000 },
    sonnet: { input: 3 / 1000000, output: 15 / 1000000 },
    opus: { input: 15 / 1000000, output: 75 / 1000000 }
  };

  const modelPricing = pricing[model] || pricing.sonnet;
  return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output);
}
