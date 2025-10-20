import { parseCSV as parseAICode, validateRow as validateAICodeRow } from '../ai-code-parser';
import { parseCSV as parseFeatures, validateRow as validateFeaturesRow } from '../power-user-features-parser';
import { parseCSV as parseAgent, validateRow as validateAgentRow } from '../agent-requests-parser';
import { normalizeEmail } from '@/types/power-users';

describe('AI Code Parser', () => {
  const validAICodeCSV = `team_id,team_name,user_id,email,person_linkedin_url,total_lines_changed,ai_lines_changed,non_ai_lines_changed,pct_ai_lines_changed,pct_non_ai_lines_changed,commit_count
3919393,Moodys Analytics,235093379,test@example.com,https://linkedin.com/in/test,1000,500,500,50,50,10`;

  it('should parse valid AI code CSV', async () => {
    const result = await parseAICode(validAICodeCSV);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      email: 'test@example.com',
      linkedinUrl: 'https://linkedin.com/in/test',
      aiLinesChanged: 500,
      totalLinesChanged: 1000,
      pctAiCode: 50,
      commitCount: 10,
    });
  });

  it('should normalize email addresses', async () => {
    const csv = `team_id,team_name,user_id,email,person_linkedin_url,total_lines_changed,ai_lines_changed,non_ai_lines_changed,pct_ai_lines_changed,pct_non_ai_lines_changed,commit_count
3919393,Moodys Analytics,235093379,  TEST@EXAMPLE.COM  ,https://linkedin.com/in/test,1000,500,500,50,50,10`;
    const result = await parseAICode(csv);
    expect(result[0].email).toBe('test@example.com');
  });

  it('should handle empty LinkedIn URL', async () => {
    const csv = `team_id,team_name,user_id,email,person_linkedin_url,total_lines_changed,ai_lines_changed,non_ai_lines_changed,pct_ai_lines_changed,pct_non_ai_lines_changed,commit_count
3919393,Moodys Analytics,235093379,test@example.com,,1000,500,500,50,50,10`;
    const result = await parseAICode(csv);
    expect(result[0].linkedinUrl).toBeUndefined();
  });

  it('should reject invalid rows', async () => {
    const invalidCSV = `team_id,team_name,user_id,email,person_linkedin_url,total_lines_changed,ai_lines_changed,non_ai_lines_changed,pct_ai_lines_changed,pct_non_ai_lines_changed,commit_count
3919393,Moodys Analytics,235093379,invalid-email,https://linkedin.com/in/test,1000,500,500,50,50,10`;
    const result = await parseAICode(invalidCSV);
    expect(result).toHaveLength(0);
  });

  it('should validate individual rows', () => {
    const validRow = {
      team_id: 1,
      team_name: 'Test',
      user_id: 123,
      email: 'test@example.com',
      person_linkedin_url: 'https://linkedin.com/in/test',
      total_lines_changed: 1000,
      ai_lines_changed: 500,
      non_ai_lines_changed: 500,
      pct_ai_lines_changed: 50,
      pct_non_ai_lines_changed: 50,
      commit_count: 10,
    };
    const result = validateAICodeRow(validRow);
    expect(result).not.toBeNull();
    expect(result?.email).toBe('test@example.com');
  });

  it('should return null for invalid rows', () => {
    const invalidRow = { email: 'invalid' };
    const result = validateAICodeRow(invalidRow);
    expect(result).toBeNull();
  });
});

describe('Power User Features Parser', () => {
  const validFeaturesCSV = `userid,email,membership_length,membership_days,is_mcp_user,is_rule_creator,is_rule_user,is_command_creator,is_command_user,num_products_used
286016606,test@example.com,2mo5d,61,true,true,true,false,false,3`;

  it('should parse valid features CSV', async () => {
    const result = await parseFeatures(validFeaturesCSV);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      email: 'test@example.com',
      isMcpUser: true,
      isRuleCreator: true,
      isRuleUser: true,
      isCommandCreator: false,
      isCommandUser: false,
      numProductsUsed: 3,
      membershipDays: 61,
    });
  });

  it('should normalize email addresses', async () => {
    const csv = `userid,email,membership_length,membership_days,is_mcp_user,is_rule_creator,is_rule_user,is_command_creator,is_command_user,num_products_used
286016606,  TEST@EXAMPLE.COM  ,2mo5d,61,true,true,true,false,false,3`;
    const result = await parseFeatures(csv);
    expect(result[0].email).toBe('test@example.com');
  });

  it('should validate individual rows', () => {
    const validRow = {
      userid: 123,
      email: 'test@example.com',
      membership_length: '1mo',
      membership_days: 30,
      is_mcp_user: true,
      is_rule_creator: false,
      is_rule_user: true,
      is_command_creator: false,
      is_command_user: false,
      num_products_used: 2,
    };
    const result = validateFeaturesRow(validRow);
    expect(result).not.toBeNull();
    expect(result?.email).toBe('test@example.com');
  });

  it('should return null for invalid rows', () => {
    const invalidRow = { email: 'invalid' };
    const result = validateFeaturesRow(invalidRow);
    expect(result).toBeNull();
  });
});

describe('Agent Requests Parser', () => {
  const validAgentCSV = `email,first_name,last_name,auth_id,total_requests,total_sessions,combined_score
test@example.com,John,Doe,auth0|123,100,50,1.0`;

  it('should parse valid agent CSV', async () => {
    const result = await parseAgent(validAgentCSV);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      totalRequests: 100,
      totalSessions: 50,
    });
  });

  it('should normalize email addresses', async () => {
    const csv = `email,first_name,last_name,auth_id,total_requests,total_sessions,combined_score
  TEST@EXAMPLE.COM  ,John,Doe,auth0|123,100,50,1.0`;
    const result = await parseAgent(csv);
    expect(result[0].email).toBe('test@example.com');
  });

  it('should handle empty names', async () => {
    const csv = `email,first_name,last_name,auth_id,total_requests,total_sessions,combined_score
test@example.com,,,auth0|123,100,50,1.0`;
    const result = await parseAgent(csv);
    // Empty strings in CSV are transformed to undefined by Zod
    expect(result[0].firstName).toBeUndefined();
    expect(result[0].lastName).toBeUndefined();
  });

  it('should validate individual rows', () => {
    const validRow = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      auth_id: 'auth0|123',
      total_requests: 100,
      total_sessions: 50,
      combined_score: 1.0,
    };
    const result = validateAgentRow(validRow);
    expect(result).not.toBeNull();
    expect(result?.email).toBe('test@example.com');
  });

  it('should return null for invalid rows', () => {
    const invalidRow = { email: 'invalid' };
    const result = validateAgentRow(invalidRow);
    expect(result).toBeNull();
  });
});

describe('Email Normalization', () => {
  it('should trim whitespace', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
  });

  it('should convert to lowercase', () => {
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });

  it('should handle both', () => {
    expect(normalizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
  });
});

