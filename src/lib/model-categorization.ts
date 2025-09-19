import { ModelCategory } from '@/types';

/**
 * Categorizes a model name into one of the predefined categories
 */
export function categorizeModel(modelName: string): ModelCategory {
  const name = modelName.toLowerCase();

  // Auto (Cursor/Anysphere models) - check first as they're most specific
  if (
    name.includes('accounts/anysphere') ||
    name.includes('cursor-') ||
    name.includes('cpt-') ||
    name.includes('dsv3-agent') ||
    name.includes('fast-apply') ||
    name.includes('fastapply') ||
    name.includes('fastcmdk') ||
    name.includes('bugbot') ||
    name.includes('cpp-dsv')
  ) {
    return 'Auto';
  }

  // Opus models
  if (name.includes('opus')) {
    return 'Opus';
  }

  // Sonnet models
  if (name.includes('sonnet')) {
    return 'Sonnet';
  }

  // Other Anthropic/Claude models
  if (
    name.includes('claude') ||
    name.includes('anthropic') ||
    name.includes('haiku')
  ) {
    return 'Anthropic (other)';
  }

  // GPT-5 models (must check before general GPT)
  if (name.includes('gpt-5')) {
    return 'GPT-5';
  }

  // Other OpenAI models
  if (
    name.includes('gpt') ||
    name.includes('ft:gpt') ||
    name.includes('o1') ||
    name.includes('o3') ||
    name.includes('o4')
  ) {
    return 'OpenAI (other)';
  }

  // Gemini models
  if (name.includes('gemini')) {
    return 'Gemini';
  }

  // Grok models
  if (name.includes('grok')) {
    return 'Grok';
  }

  // Default to Other
  return 'Other';
}

/**
 * Gets a human-readable description of what models are included in each category
 */
export function getCategoryDescription(category: ModelCategory): string {
  const descriptions: Record<ModelCategory, string> = {
    'Opus': 'Claude Opus models (all variants)',
    'Sonnet': 'Claude Sonnet models (all variants)',
    'Anthropic (other)': 'Other Claude/Anthropic models (Haiku, etc.)',
    'GPT-5': 'OpenAI GPT-5 models',
    'OpenAI (other)': 'Other OpenAI models (GPT-4, GPT-3.5, O1, O3, O4)',
    'Gemini': 'Google Gemini models',
    'Grok': 'xAI Grok models',
    'Auto': 'Cursor/Anysphere automated models',
    'Other': 'All other models'
  };

  return descriptions[category];
}

/**
 * Validates if a category name is valid
 */
export function isValidCategory(category: string): category is ModelCategory {
  const validCategories: ModelCategory[] = [
    'Opus',
    'Sonnet',
    'Anthropic (other)',
    'GPT-5',
    'OpenAI (other)',
    'Gemini',
    'Grok',
    'Auto',
    'Other'
  ];

  return validCategories.includes(category as ModelCategory);
}

/**
 * Gets example model names for each category (for testing/documentation)
 */
export function getCategoryExamples(category: ModelCategory): string[] {
  const examples: Record<ModelCategory, string[]> = {
    'Opus': [
      'claude-4-opus',
      'claude-4-1-opus-thinking',
      'claude-3-opus-20240229'
    ],
    'Sonnet': [
      'claude-4-sonnet-thinking',
      'claude-3-5-sonnet-20241022',
      'claude-4-sonnet-vertex-global'
    ],
    'Anthropic (other)': [
      'claude-3-haiku-20240307',
      'claude-3-5-haiku-20241022'
    ],
    'GPT-5': [
      'gpt-5',
      'gpt-5-high',
      'gpt-5-fast'
    ],
    'OpenAI (other)': [
      'gpt-4o',
      'gpt-3.5-turbo',
      'o1',
      'o3',
      'o4-mini'
    ],
    'Gemini': [
      'gemini-2.5-pro-latest',
      'gemini-2.5-flash-latest'
    ],
    'Grok': [
      'grok-4-0709',
      'grok-code-fast-1'
    ],
    'Auto': [
      'accounts/anysphere/models/dsv3-agent-0723',
      'cursor-fast',
      'cpt-tab-05-01-prod'
    ],
    'Other': [
      'accounts/fireworks/models/llama-v3p1-70b-instruct'
    ]
  };

  return examples[category] || [];
}
