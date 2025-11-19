import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs';
import 'dotenv/config'; 

const MONGO_URI = process.env.MONGO_URL;
const DOCKER_CONTAINER = process.env.DOCKER_CONTAINER;
const EXECUTION_STATS = `"executionStats"`;
const mdFile = './docs/performanceReport.md';


// Todo: Add more fields to the recommended indexes
const recommendedIndexes = ["borough", "cuisine", "name", "grades.score", "location.coordinates", "location", "address.street"];


/*
 * Executes a Mongo Shell query with .explain() and returns its parsed result.
 */
async function getMongoExplain( mongoQuery, mongoUri = MONGO_URI, dockerContainer = DOCKER_CONTAINER, executionStats = EXECUTION_STATS) {

  const args = [
      'exec', '-i',
      dockerContainer,
      'mongosh',
      '--quiet',
      mongoUri,
      '--eval',
      `JSON.stringify((${mongoQuery}).explain(${executionStats}))`
    ];
  
  try {
    const { stdout } = await execa('docker', args);
    const cleanedOutput = stdout.trim().split('\n').pop();
    return JSON.parse(cleanedOutput);
  } catch (err) {
    console.error('Error ejecutando explain:', err);
  }
};


// Improved index detection functions
function isUsingIndex(plan) {
  if (!plan) return false;
  
  // Direct index scan
  if (plan.stage === 'IXSCAN') return true;
  
  // Check nested stages
  if (plan.inputStage) return isUsingIndex(plan.inputStage);
  
  // Check parallel stages
  if (plan.inputStages) {
    return plan.inputStages.some(isUsingIndex);
  }
  
  // Check sharded clusters
  if (plan.shards) {
    return plan.shards.some(shard => isUsingIndex(shard.executionStages));
  }
  
  return false;
}

// Detect if a field is used in a query operation that would benefit from an index
function isFieldUsedInQuery(field, commandMongosh) {
  // Check for basic field usage
  if (!commandMongosh.includes(field)) return false;
  
  // Check for field usage in specific query operations
  const queryPatterns = [
    `{${field}:`,          // Basic query
    `.find({${field}:`,    // Find operation
    `.count({${field}:`,   // Count operation
    `.sort({${field}:`,    // Sort operation
    `'${field}'`,          // Aggregation pipeline
    `"${field}"`           // Aggregation pipeline (quoted)
  ];
  
  return queryPatterns.some(pattern => commandMongosh.includes(pattern));
}

// Enhanced query analysis
async function analyzeQuery(commandMongosh) {
  const explain = await getMongoExplain(commandMongosh);
  if (!explain) {
    return {
      commandMongosh,
      error: "Failed to get explain plan"
    };
  }

  const execStats = explain.executionStats;
  const planner = explain.queryPlanner.winningPlan;
  const executionTime = execStats.executionTimeMillis;
  const documentsReturned = execStats.nReturned;
  const documentsExamined = execStats.totalDocsExamined;
  const stage = planner.stage || (planner.inputStage && planner.inputStage.stage);

  const issues = [];

  // Enhanced index usage analysis
  recommendedIndexes.forEach(field => {
    if (isFieldUsedInQuery(field, commandMongosh) && !isUsingIndex(planner)) {
      // Determine the severity based on query type
      let severity = "medium";
      let problemType = "Filtering";
      
      if (commandMongosh.includes(`.sort({${field}:`)) {
        severity = "high";
        problemType = "Sorting";
      } else if (commandMongosh.includes(`.find({${field}:`)) {
        problemType = "Filtering";
      } else if (commandMongosh.includes(`.count({${field}:`)) {
        problemType = "Counting";
      }
      
      issues.push({
        message: `‼️ ${problemType} on unindexed field '${field}' - performance may suffer.`,
        severity,
        field
      });
    }
  });

  // Query efficiency analysis
  if (documentsExamined > 5 * documentsReturned && documentsReturned > 0) {
    issues.push({
      message: `⚠️ Examined ${documentsExamined} docs to return ${documentsReturned} (ratio ${(documentsExamined/documentsReturned).toFixed(1)}:1)`,
      severity: "high"
    });
  }

  // Check for COLLSCAN when we expected IXSCAN
  if (!isUsingIndex(planner)) {
    const shouldHaveIndex = recommendedIndexes.some(field => 
      isFieldUsedInQuery(field, commandMongosh));
    
    if (shouldHaveIndex && planner.stage === 'COLLSCAN') {
      issues.push({
        message: "🚨 Full collection scan detected where index could be used",
        severity: "critical"
      });
    }
  }

  return {
    commandMongosh,
    executionTime,
    documentsReturned,
    documentsExamined,
    stage,
    issues,
    explainPlan: planner // Include full plan for debugging
  };
}

function generateReport({ commandMongosh, executionTime, documentsReturned, documentsExamined, stage, issues }) {
  let report = chalk.bold("\n📊 Analysis Report\n");
  report += `- 🧪 Query: ${chalk.blue(commandMongosh)}\n`;
  report += `- ⏱️ Execution time: ${chalk.yellow(executionTime + " ms")}\n`;
  report += `- 📚 Returned documents: ${chalk.green(documentsReturned)}\n`;
  report += `- 🔍 Examined documents: ${chalk.green(documentsExamined)}\n`;
  report += `- 🛠️ Execution stage: ${chalk.cyan(stage)}\n`;

  if (issues.length > 0) {
    // Group issues by severity for better visual organization
    const criticalIssues = issues.filter(i => i.severity === "critical");
    const highIssues = issues.filter(i => i.severity === "high");
    const mediumIssues = issues.filter(i => i.severity === "medium");

    if (criticalIssues.length > 0) {
      report += chalk.red.bold("\n🔥 Critical Issues:\n");
      criticalIssues.forEach(issue => {
        report += chalk.red(`- ${issue.message}\n`);
      });
    }

    if (highIssues.length > 0) {
      report += chalk.yellow.bold("\n⚠️ High Priority Issues:\n");
      highIssues.forEach(issue => {
        report += chalk.yellow(`- ${issue.message}\n`);
      });
    }

    if (mediumIssues.length > 0) {
      report += chalk.blue.bold("\nℹ️ Recommendations:\n");
      mediumIssues.forEach(issue => {
        report += chalk.blue(`- ${issue.message}\n`);
      });
    }

    // Add index suggestions if needed
    const missingIndexes = [...new Set(issues
      .filter(i => i.field)
      .map(i => i.field))];
      
    if (missingIndexes.length > 0) {
      report += chalk.magenta.bold("\n💡 Suggested Indexes:\n");
      missingIndexes.forEach(field => {
        report += chalk.magenta(`- Create index: db.restaurants.createIndex({ ${field}: 1 })\n`);
      });
    }
  } else {
    report += chalk.green.bold("\n✅ No significant issues were identified.\n");
  }

  return report;
}

// Updated report generation to handle new issue format
function generateReportMD({ commandMongosh, executionTime, documentsReturned, documentsExamined, stage, issues }) {
  let report = "## 📊 Query Performance Report\n\n";
  report += `- 🧪 **Query**: \`${commandMongosh}\`\n`;
  report += `- ⏱️ **Execution time**: ${executionTime} ms\n`;
  report += `- 📚 **Documents returned**: ${documentsReturned}\n`;
  report += `- 🔍 **Documents examined**: ${documentsExamined}\n`;
  report += `- 🛠️ **Execution stage**: ${stage}\n`;

  if (issues.length > 0) {
    report += "\n## 🚨 Performance Issues\n";
    
    // Group by severity
    const criticalIssues = issues.filter(i => i.severity === "critical");
    const highIssues = issues.filter(i => i.severity === "high");
    const mediumIssues = issues.filter(i => i.severity === "medium");
    
    if (criticalIssues.length > 0) {
      report += "\n### 🔥 Critical Issues\n";
      criticalIssues.forEach(issue => {
        report += `- ${issue.message}\n`;
      });
    }
    
    if (highIssues.length > 0) {
      report += "\n### ⚠️ High Priority Issues\n";
      highIssues.forEach(issue => {
        report += `- ${issue.message}\n`;
      });
    }
    
    if (mediumIssues.length > 0) {
      report += "\n### ℹ️ Recommendations\n";
      mediumIssues.forEach(issue => {
        report += `- ${issue.message}\n`;
      });
    }
    
    // Add index creation suggestions
    const missingIndexes = [...new Set(issues
      .filter(i => i.field)
      .map(i => i.field))];
      
    if (missingIndexes.length > 0) {
      report += "\n### 💡 Suggested Indexes\n";
      report += "Consider creating these indexes:\n```javascript\n";
      missingIndexes.forEach(field => {
        report += `db.restaurants.createIndex({ ${field}: 1 });\n`;
      });
      report += "```\n";
    }
  } else {
    report += "\n## ✅ No significant issues detected\n";
  }

  return report;
}


/**
 * APP function.
 * Reads queries from a file, analyzes each query's performance,
 */
async function main() {

  const input = fs.readFileSync('./query/queries.js', 'utf8');
  const lines = input.split('\n'); 
  const analysisResults = [];

 for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('db.restaurants.')) {
    const result = await analyzeQuery(trimmed.replace(/;$/, ''));
    analysisResults.push(result);
  }
}
    
  if (fs.existsSync(mdFile)) {
     fs.unlinkSync(mdFile);
  }
  let i = 0;
  analysisResults.forEach(result => {
    const report = generateReport(result);
    const reportMD = generateReportMD(result);
    ++i;
    fs.appendFileSync(mdFile, `${i}. ${reportMD}` + '\n\n');
    console.log(i+'. '+report);
  });
}

main();