/**
 * Generate sample data for 1000 fake developers
 * Creates realistic distributions for AI code metrics, power user features, and agent requests
 */

import fs from 'fs';
import path from 'path';

// Sample first and last names for generating realistic users
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Andrew', 'Emily', 'Paul', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah',
  'Timothy', 'Stephanie', 'Ronald', 'Dorothy', 'Jason', 'Rebecca', 'Edward', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Amy', 'Gary', 'Kathleen',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Brenda', 'Stephen', 'Emma',
  'Larry', 'Anna', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Samantha',
  'Benjamin', 'Katherine', 'Samuel', 'Christine', 'Raymond', 'Helen', 'Gregory', 'Debra',
  'Alexander', 'Rachel', 'Patrick', 'Carolyn', 'Frank', 'Janet', 'Jack', 'Maria',
  'Dennis', 'Catherine', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Ruth',
  'Jose', 'Julie', 'Adam', 'Olivia', 'Nathan', 'Joyce', 'Henry', 'Virginia',
  'Douglas', 'Victoria', 'Zachary', 'Kelly', 'Peter', 'Lauren', 'Kyle', 'Christina',
  'Ethan', 'Joan', 'Jeremy', 'Evelyn', 'Walter', 'Judith', 'Christian', 'Andrea',
  'Keith', 'Hannah', 'Roger', 'Megan', 'Terry', 'Cheryl', 'Austin', 'Jacqueline',
  'Sean', 'Martha', 'Gerald', 'Madison', 'Carl', 'Teresa', 'Harold', 'Gloria',
  'Dylan', 'Sara', 'Arthur', 'Janice', 'Lawrence', 'Kathryn', 'Jordan', 'Ann',
  'Jesse', 'Jean', 'Bryan', 'Abigail', 'Billy', 'Sophia', 'Bruce', 'Frances',
  'Gabriel', 'Isabella', 'Joe', 'Alexis', 'Logan', 'Alice', 'Alan', 'Judy',
  'Juan', 'Julia', 'Albert', 'Grace', 'Willie', 'Amber', 'Elijah', 'Denise',
  'Randy', 'Danielle', 'Wayne', 'Marilyn', 'Vincent', 'Beverly', 'Mason', 'Brittany',
  'Roy', 'Theresa', 'Ralph', 'Kayla', 'Bobby', 'Alexis', 'Russell', 'Doris',
  'Bradley', 'Lori', 'Philip', 'Tiffany', 'Eugene', 'Louise'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
  'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
  'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell',
  'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales', 'Fisher',
  'Vasquez', 'Simmons', 'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton', 'Graham',
  'Reynolds', 'Griffin', 'Wallace', 'Moreno', 'West', 'Cole', 'Hayes', 'Bryant',
  'Herrera', 'Gibson', 'Ellis', 'Tran', 'Medina', 'Aguilar', 'Stevens', 'Murray',
  'Ford', 'Castro', 'Marshall', 'Owens', 'Harrison', 'Fernandez', 'McDonald', 'Woods',
  'Washington', 'Kennedy', 'Wells', 'Vargas', 'Henry', 'Chen', 'Freeman', 'Webb',
  'Tucker', 'Guzman', 'Burns', 'Crawford', 'Olson', 'Simpson', 'Porter', 'Hunter'
];

// Single company for all users
const COMPANY_DOMAIN = 'acmecorp.com';

// Seeded random number generator for reproducibility
class Random {
  private seed: number;
  
  constructor(seed: number = 12345) {
    this.seed = seed;
  }
  
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
  
  // Pareto distribution for realistic power-law distributions
  pareto(scale: number, shape: number): number {
    const u = this.next();
    return scale / Math.pow(u, 1 / shape);
  }
  
  // Normal distribution approximation (Box-Muller transform)
  normal(mean: number, stdDev: number): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
  
  boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }
}

interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  
  // AI Code metrics
  totalLinesChanged: number;
  aiLinesChanged: number;
  nonAiLinesChanged: number;
  pctAiLinesChanged: number;
  pctNonAiLinesChanged: number;
  commitCount: number;
  
  // Power features
  membershipDays: number;
  isMcpUser: boolean;
  isRuleCreator: boolean;
  isRuleUser: boolean;
  isCommandCreator: boolean;
  isCommandUser: boolean;
  numProductsUsed: number;
  
  // Agent metrics
  totalRequests: number;
  totalSessions: number;
  combinedScore: number;
  authId: string;
}

function generateUsers(count: number): User[] {
  const rng = new Random(42);
  const users: User[] = [];
  const usedEmails = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    const firstName = rng.choice(FIRST_NAMES);
    const lastName = rng.choice(LAST_NAMES);
    
    // Generate unique email
    let email: string;
    let attempts = 0;
    do {
      const suffix = attempts > 0 ? attempts : '';
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@${COMPANY_DOMAIN}`;
      attempts++;
    } while (usedEmails.has(email));
    usedEmails.add(email);
    
    const userId = 100000000 + i;
    
    // LinkedIn URL (80% have one)
    const hasLinkedIn = rng.boolean(0.8);
    const linkedinUrl = hasLinkedIn 
      ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${rng.nextInt(1000, 9999)}`
      : '';
    
    // Generate engagement tier (determines overall metrics)
    // Using 4 tiers: Power (10%), Active (30%), Casual (40%), Low (20%)
    const tierRoll = rng.next();
    let tier: 'power' | 'active' | 'casual' | 'low';
    if (tierRoll < 0.1) tier = 'power';
    else if (tierRoll < 0.4) tier = 'active';
    else if (tierRoll < 0.8) tier = 'casual';
    else tier = 'low';
    
    // Sessions with power-law distribution
    let totalSessions: number;
    if (tier === 'power') {
      totalSessions = Math.round(rng.nextFloat(500, 1500));
    } else if (tier === 'active') {
      totalSessions = Math.round(rng.nextFloat(200, 600));
    } else if (tier === 'casual') {
      totalSessions = Math.round(rng.nextFloat(50, 250));
    } else {
      totalSessions = Math.round(rng.nextFloat(5, 60));
    }
    
    // Agent requests (roughly 3-10x sessions for engaged users)
    let totalRequests: number;
    if (tier === 'power') {
      totalRequests = Math.round(totalSessions * rng.nextFloat(6, 10));
    } else if (tier === 'active') {
      totalRequests = Math.round(totalSessions * rng.nextFloat(4, 8));
    } else if (tier === 'casual') {
      totalRequests = Math.round(totalSessions * rng.nextFloat(2, 5));
    } else {
      totalRequests = Math.round(totalSessions * rng.nextFloat(1, 3));
    }
    
    // AI Code metrics
    let totalLinesChanged: number;
    if (tier === 'power') {
      totalLinesChanged = Math.round(rng.pareto(50000, 1.5));
    } else if (tier === 'active') {
      totalLinesChanged = Math.round(rng.pareto(20000, 1.5));
    } else if (tier === 'casual') {
      totalLinesChanged = Math.round(rng.pareto(5000, 1.5));
    } else {
      totalLinesChanged = Math.round(rng.pareto(1000, 1.5));
    }
    
    // AI percentage (most users 30-70%, some higher)
    const pctAiLinesChanged = Math.max(5, Math.min(95, rng.normal(50, 20)));
    const aiLinesChanged = Math.round(totalLinesChanged * (pctAiLinesChanged / 100));
    const nonAiLinesChanged = totalLinesChanged - aiLinesChanged;
    const pctNonAiLinesChanged = 100 - pctAiLinesChanged;
    
    // Commits roughly scale with lines
    const commitCount = Math.max(1, Math.round(totalLinesChanged / rng.nextFloat(500, 2000)));
    
    // Membership days (30 to 365)
    const membershipDays = rng.nextInt(30, 365);
    
    // Power features - higher tier = more likely to use advanced features
    let isMcpUser: boolean;
    let isRuleCreator: boolean;
    let isRuleUser: boolean;
    let isCommandCreator: boolean;
    let isCommandUser: boolean;
    
    if (tier === 'power') {
      isMcpUser = rng.boolean(0.70);
      isRuleCreator = rng.boolean(0.60);
      isRuleUser = rng.boolean(0.75);
      isCommandCreator = rng.boolean(0.55);
      isCommandUser = rng.boolean(0.70);
    } else if (tier === 'active') {
      isMcpUser = rng.boolean(0.40);
      isRuleCreator = rng.boolean(0.35);
      isRuleUser = rng.boolean(0.50);
      isCommandCreator = rng.boolean(0.30);
      isCommandUser = rng.boolean(0.45);
    } else if (tier === 'casual') {
      isMcpUser = rng.boolean(0.15);
      isRuleCreator = rng.boolean(0.10);
      isRuleUser = rng.boolean(0.20);
      isCommandCreator = rng.boolean(0.08);
      isCommandUser = rng.boolean(0.15);
    } else {
      isMcpUser = rng.boolean(0.05);
      isRuleCreator = rng.boolean(0.02);
      isRuleUser = rng.boolean(0.05);
      isCommandCreator = rng.boolean(0.02);
      isCommandUser = rng.boolean(0.05);
    }
    
    // Count products used (1-4, based on tier)
    let numProductsUsed: number;
    if (tier === 'power') {
      numProductsUsed = rng.nextInt(3, 4);
    } else if (tier === 'active') {
      numProductsUsed = rng.nextInt(2, 3);
    } else {
      numProductsUsed = rng.nextInt(1, 2);
    }
    
    // Combined score for agent (normalized 0-1, correlates with tier)
    const combinedScore = tier === 'power' ? rng.nextFloat(0.7, 1.0) :
                         tier === 'active' ? rng.nextFloat(0.4, 0.7) :
                         tier === 'casual' ? rng.nextFloat(0.1, 0.4) :
                         rng.nextFloat(0.01, 0.1);
    
    // Auth ID
    const authProviders = ['github', 'auth0', 'google-oauth2'];
    const authProvider = rng.choice(authProviders);
    const authId = `${authProvider}|user_${rng.nextInt(100000, 999999)}`;
    
    users.push({
      userId,
      email,
      firstName,
      lastName,
      linkedinUrl,
      totalLinesChanged,
      aiLinesChanged,
      nonAiLinesChanged,
      pctAiLinesChanged,
      pctNonAiLinesChanged,
      commitCount,
      membershipDays,
      isMcpUser,
      isRuleCreator,
      isRuleUser,
      isCommandCreator,
      isCommandUser,
      numProductsUsed,
      totalRequests,
      totalSessions,
      combinedScore,
      authId
    });
  }
  
  return users;
}

function formatMembershipLength(days: number): string {
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  const weeks = Math.floor(remainingDays / 7);
  const finalDays = remainingDays % 7;
  
  const parts: string[] = [];
  if (months > 0) parts.push(`${months}mo`);
  if (weeks > 0) parts.push(`${weeks}w`);
  if (finalDays > 0 || parts.length === 0) parts.push(`${finalDays}d`);
  
  return parts.join('');
}

function generateAICodeCSV(users: User[]): string {
  const header = 'team_id,team_name,user_id,email,person_linkedin_url,total_lines_changed,ai_lines_changed,non_ai_lines_changed,pct_ai_lines_changed,pct_non_ai_lines_changed,commit_count';
  
  const rows = users.map(user => {
    const teamId = 9999999;
    const teamName = 'Sample Development Team';
    
    return [
      teamId,
      teamName,
      user.userId,
      user.email,
      user.linkedinUrl,
      user.totalLinesChanged,
      user.aiLinesChanged,
      user.nonAiLinesChanged,
      user.pctAiLinesChanged.toFixed(2),
      user.pctNonAiLinesChanged.toFixed(2),
      user.commitCount
    ].join(',');
  });
  
  return [header, ...rows].join('\n');
}

function generatePowerUserFeaturesCSV(users: User[]): string {
  const header = 'userid,email,membership_length,membership_days,is_mcp_user,is_rule_creator,is_rule_user,is_command_creator,is_command_user,num_products_used';
  
  const rows = users.map(user => {
    return [
      user.userId,
      user.email,
      formatMembershipLength(user.membershipDays),
      user.membershipDays,
      user.isMcpUser,
      user.isRuleCreator,
      user.isRuleUser,
      user.isCommandCreator,
      user.isCommandUser,
      user.numProductsUsed
    ].join(',');
  });
  
  return [header, ...rows].join('\n');
}

function generateAgentRequestsCSV(users: User[]): string {
  const header = 'email,first_name,last_name,auth_id,total_requests,total_sessions,combined_score';
  
  const rows = users.map(user => {
    return [
      user.email,
      user.firstName,
      user.lastName,
      user.authId,
      user.totalRequests,
      user.totalSessions,
      user.combinedScore.toFixed(4)
    ].join(',');
  });
  
  return [header, ...rows].join('\n');
}

// Generate data
console.log('Generating 1000 sample users...');
const users = generateUsers(1000);

console.log('Creating CSV files...');
const aiCodeCSV = generateAICodeCSV(users);
const powerFeaturesCSV = generatePowerUserFeaturesCSV(users);
const agentRequestsCSV = generateAgentRequestsCSV(users);

// Write files
const sampleDataDir = path.join(__dirname, '..', 'sample-data');
if (!fs.existsSync(sampleDataDir)) {
  fs.mkdirSync(sampleDataDir, { recursive: true });
}

fs.writeFileSync(path.join(sampleDataDir, 'sample-ai-code-1000-users.csv'), aiCodeCSV);
fs.writeFileSync(path.join(sampleDataDir, 'sample-power-features-1000-users.csv'), powerFeaturesCSV);
fs.writeFileSync(path.join(sampleDataDir, 'sample-agent-requests-1000-users.csv'), agentRequestsCSV);

console.log('✅ Sample data generated successfully!');
console.log('\nFiles created:');
console.log('  - sample-data/sample-ai-code-1000-users.csv');
console.log('  - sample-data/sample-power-features-1000-users.csv');
console.log('  - sample-data/sample-agent-requests-1000-users.csv');
console.log('\nDistribution summary:');
const powerUsers = users.filter(u => u.totalSessions >= 500).length;
const activeUsers = users.filter(u => u.totalSessions >= 200 && u.totalSessions < 500).length;
const casualUsers = users.filter(u => u.totalSessions >= 50 && u.totalSessions < 200).length;
const lowUsers = users.filter(u => u.totalSessions < 50).length;

console.log(`  - Power users (500+ sessions): ${powerUsers}`);
console.log(`  - Active users (200-499 sessions): ${activeUsers}`);
console.log(`  - Casual users (50-199 sessions): ${casualUsers}`);
console.log(`  - Low engagement (<50 sessions): ${lowUsers}`);

const mcpUsers = users.filter(u => u.isMcpUser).length;
const ruleUsers = users.filter(u => u.isRuleCreator || u.isRuleUser).length;
const commandUsers = users.filter(u => u.isCommandCreator || u.isCommandUser).length;

console.log(`\nFeature adoption:`);
console.log(`  - MCP users: ${mcpUsers} (${(mcpUsers/users.length*100).toFixed(1)}%)`);
console.log(`  - Rule users: ${ruleUsers} (${(ruleUsers/users.length*100).toFixed(1)}%)`);
console.log(`  - Command users: ${commandUsers} (${(commandUsers/users.length*100).toFixed(1)}%)`);

