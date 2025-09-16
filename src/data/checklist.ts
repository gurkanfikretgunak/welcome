export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: 'setup' | 'access' | 'training' | 'integration'
  required: boolean
  estimatedTime?: string
}

export const ONBOARDING_CHECKLIST: ChecklistItem[] = [
  // SETUP CATEGORY
  {
    id: 'development-environment',
    title: 'Development Environment Setup',
    description: 'Install and configure development tools (IDE, Git, Node.js, Docker)',
    category: 'setup',
    required: true,
    estimatedTime: '2-3 hours'
  },
  {
    id: 'company-accounts',
    title: 'Company Account Creation',
    description: 'Create accounts for company tools (Slack, Jira, Confluence, etc.)',
    category: 'setup',
    required: true,
    estimatedTime: '1 hour'
  },
  {
    id: 'vpn-setup',
    title: 'VPN Configuration',
    description: 'Install and configure company VPN for secure remote access',
    category: 'setup',
    required: true,
    estimatedTime: '30 minutes'
  },
  
  // ACCESS CATEGORY
  {
    id: 'repository-access',
    title: 'Repository Access',
    description: 'Gain access to relevant Git repositories and understand branching strategy',
    category: 'access',
    required: true,
    estimatedTime: '1 hour'
  },
  {
    id: 'database-access',
    title: 'Database Access',
    description: 'Configure database connections for development and staging environments',
    category: 'access',
    required: true,
    estimatedTime: '45 minutes'
  },
  {
    id: 'server-access',
    title: 'Server Access',
    description: 'SSH access to development and staging servers',
    category: 'access',
    required: false,
    estimatedTime: '30 minutes'
  },

  // TRAINING CATEGORY
  {
    id: 'codebase-review',
    title: 'Codebase Architecture Review',
    description: 'Review main application architecture and coding standards',
    category: 'training',
    required: true,
    estimatedTime: '4-6 hours'
  },
  {
    id: 'documentation-review',
    title: 'Documentation Review',
    description: 'Read technical documentation, API docs, and development guidelines',
    category: 'training',
    required: true,
    estimatedTime: '2-3 hours'
  },
  {
    id: 'security-training',
    title: 'Security Training',
    description: 'Complete mandatory security awareness training',
    category: 'training',
    required: true,
    estimatedTime: '1 hour'
  },
  {
    id: 'testing-procedures',
    title: 'Testing Procedures',
    description: 'Learn testing frameworks, procedures, and quality standards',
    category: 'training',
    required: true,
    estimatedTime: '2 hours'
  },

  // INTEGRATION CATEGORY
  {
    id: 'team-meetings',
    title: 'Team Introduction Meetings',
    description: 'Meet with team members, stakeholders, and project managers',
    category: 'integration',
    required: true,
    estimatedTime: '2-3 hours'
  },
  {
    id: 'first-task-assignment',
    title: 'First Task Assignment',
    description: 'Receive and begin work on first development task',
    category: 'integration',
    required: true,
    estimatedTime: 'Varies'
  },
  {
    id: 'code-review-process',
    title: 'Code Review Process',
    description: 'Participate in code review process as both reviewer and reviewee',
    category: 'integration',
    required: true,
    estimatedTime: '1-2 hours'
  },
  {
    id: 'deployment-process',
    title: 'Deployment Process',
    description: 'Learn and practice deployment procedures and CI/CD pipeline',
    category: 'integration',
    required: true,
    estimatedTime: '2 hours'
  },
  {
    id: 'mentorship-setup',
    title: 'Mentorship Setup',
    description: 'Connect with assigned mentor and establish regular check-ins',
    category: 'integration',
    required: false,
    estimatedTime: '30 minutes'
  }
]

export const CATEGORY_LABELS = {
  setup: 'ENVIRONMENT SETUP',
  access: 'ACCESS & PERMISSIONS',
  training: 'TRAINING & LEARNING',
  integration: 'TEAM INTEGRATION'
}

export const CATEGORY_DESCRIPTIONS = {
  setup: 'Configure your development environment and essential tools',
  access: 'Obtain necessary access permissions and credentials',
  training: 'Complete required training and documentation review',
  integration: 'Integrate with team processes and workflows'
}
