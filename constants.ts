import { Task, TaskStatus, TaskType, TaskPriority } from './types';

export const KANBAN_COLUMNS: TaskStatus[] = [
  TaskStatus.Triage,
  TaskStatus.Today,
  TaskStatus.Next,
  TaskStatus.Backlog,
  TaskStatus.Done,
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const twoWeeks = new Date(today);
twoWeeks.setDate(twoWeeks.getDate() + 14);


export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Q3 Roadmap',
    description: 'Review and get final approval on the Q3 roadmap with leadership. Ensure all features are properly estimated and prioritized.',
    type: TaskType.Roadmap,
    status: TaskStatus.Today,
    priority: TaskPriority.Urgent,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: tomorrow.toISOString().split('T')[0],
    assignee: { name: 'Pat Product', avatarUrl: 'https://i.pravatar.cc/150?u=pat.product@example.com' },
    product: 'Platform Core',
  },
  {
    id: 'task-2',
    title: 'User feedback session on new dashboard',
    description: 'Conduct a feedback session with 5-7 power users to gather qualitative data on the new dashboard design.',
    type: TaskType.FeatureRequest,
    status: TaskStatus.Next,
    priority: TaskPriority.High,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: { name: 'Casey Coder', avatarUrl: 'https://i.pravatar.cc/150?u=casey.coder@example.com' },
    product: 'Analytics Suite',
    featureRequests: [
        {
            id: 'fr-1',
            requestorName: 'Alex',
            requestorRole: 'Sales Lead',
            rawRequest: 'My team is spending way too much time creating reports manually. We need a way to just get a weekly summary of our key metrics emailed to us every Monday morning. It would save us hours and let us focus on selling.',
            painPoint: 'Manual, time-consuming report generation.',
            businessContext: 'The sales team is losing valuable time on administrative tasks (reporting) instead of core sales activities.',
            value: 'Increased sales team productivity, faster access to key metrics, and potentially more time dedicated to revenue-generating activities.'
        },
        {
            id: 'fr-2',
            requestorName: 'Dana',
            requestorRole: 'Customer Success',
            rawRequest: 'It\'s hard to tell which customers are at risk of churning. If we could see a health score or some kind of warning when a customer\'s usage drops, we could intervene proactively.',
        }
    ]
  },
  {
    id: 'task-3',
    title: 'Document SSO requirements',
    description: 'Write the PRD for the upcoming Single Sign-On feature. Include technical constraints, user stories, and acceptance criteria.',
    type: TaskType.Requirements,
    status: TaskStatus.Backlog,
    priority: TaskPriority.High,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: twoWeeks.toISOString().split('T')[0],
    product: 'Platform Core',
    userStories: [
        {
            id: 'us-1',
            title: 'User Login via SSO',
            story: 'As an enterprise user, I want to log in using my company\'s SSO credentials so that I can access the platform securely and without needing a separate password.',
            acceptanceCriteria: '- User can click a "Login with SSO" button.\n- User is redirected to their identity provider.\n- After successful authentication, the user is logged into PM OS and redirected to the dashboard.',
        },
        {
            id: 'us-2',
            title: 'Admin SSO Configuration',
            story: 'As a system admin, I want to configure our SSO provider in the settings so that our team can use it for authentication.',
            acceptanceCriteria: '- An admin can navigate to an "Authentication" settings page.\n- The admin can input our Identity Provider metadata URL.\n- The system successfully validates and saves the configuration.',
        }
    ]
  },
  {
    id: 'task-4',
    title: 'Mobile login button is misaligned',
    description: 'On screens smaller than 375px, the main login button is pushed off-center. This is a visual bug but impacts first impressions.',
    type: TaskType.BugReport,
    status: TaskStatus.Backlog,
    priority: TaskPriority.Medium,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: { name: 'Dev Team', avatarUrl: 'https://i.pravatar.cc/150?u=dev.team@example.com' },
    product: 'Website',
    bugReports: [
        {
            id: 'br-1',
            title: 'Button Alignment on Mobile',
            currentBehavior: 'The main login button is pushed to the right and is partially off-center on screen widths below 375px.',
            expectedBehavior: 'The main login button should remain perfectly centered horizontally on all screen sizes, including those below 375px.',
        },
        {
            id: 'br-2',
            title: 'Focus Ring is Incorrect Color',
            currentBehavior: 'When tabbing to the login button, the focus outline is the default blue color provided by the browser.',
            expectedBehavior: 'The focus outline should match the brand color, which is #00A39C.',
        }
    ],
    comments: [
        {
            id: 'comment-1',
            author: { name: 'Casey Coder', avatarUrl: 'https://i.pravatar.cc/150?u=casey.coder@example.com' },
            content: 'I\'ve reproduced this on an iPhone SE. It seems to be a flexbox alignment issue in the main container.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'comment-2',
            author: { name: 'Pat Product', avatarUrl: 'https://i.pravatar.cc/150?u=pat.product@example.com' },
            content: 'Thanks for confirming, @Casey. Is this a quick fix? If so, let\'s try to get it into the next sprint.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
    ]
  },
  {
    id: 'task-5',
    title: 'Sync with Marketing on launch plan',
    description: 'Meeting notes from the sync with the marketing team. Key takeaways: blog post scheduled for 8/15, social media campaign to start 8/10.',
    type: TaskType.MeetingNote,
    status: TaskStatus.Done,
    priority: TaskPriority.Low,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    product: 'Analytics Suite',
  },
  {
    id: 'task-6',
    title: 'Stakeholder check-in with Sales VP',
    description: 'Regular check-in with the VP of Sales to align on upcoming feature priorities and gather feedback from the sales team.',
    type: TaskType.Stakeholder,
    status: TaskStatus.Next,
    priority: TaskPriority.Medium,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: { name: 'Pat Product', avatarUrl: 'https://i.pravatar.cc/150?u=pat.product@example.com' },
    stakeholders: [
        { id: 'sh-1', name: 'Valerie Pierce', role: 'VP of Sales' },
        { id: 'sh-2', name: 'Samuels Consulting', role: 'External Partner' },
    ]
  },
  {
    id: 'task-7',
    title: 'Review new user sign-up flow',
    description: 'A new user has reported an issue during sign-up. Needs initial investigation and prioritization.',
    type: TaskType.BugReport,
    status: TaskStatus.Triage,
    priority: TaskPriority.High,
    createdAt: new Date().toISOString(),
    product: 'Platform Core',
  },
];

export const TASK_TYPE_COLORS: { [key in TaskType]: string } = {
  [TaskType.Stakeholder]: 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
  [TaskType.Requirements]: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  [TaskType.MeetingNote]: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100',
  [TaskType.FeatureRequest]: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
  [TaskType.BugReport]: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
  [TaskType.Roadmap]: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
};

export const TASK_PRIORITY_COLORS: { [key in TaskPriority]: string } = {
    [TaskPriority.Low]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [TaskPriority.Medium]: 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
    [TaskPriority.High]: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    [TaskPriority.Urgent]: 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200',
};