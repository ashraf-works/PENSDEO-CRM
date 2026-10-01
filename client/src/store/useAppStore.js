import { create } from 'zustand';

// Pre-configured mock personas for instant role switching and demo validation
const mockUsers = {
  SuperAdmin: {
    _id: 'usr_admin',
    name: 'Alex Vance',
    email: 'admin@agency.com',
    role: 'SuperAdmin',
    department: 'Development',
  },
  Manager: {
    _id: 'usr_manager',
    name: 'Sarah Jenkins',
    email: 'sarah@agency.com',
    role: 'Manager',
    department: 'Design',
  },
  Employee: {
    _id: 'usr_emp',
    name: 'David Miller',
    email: 'david@agency.com',
    role: 'Employee',
    department: 'Development',
  },
  Client: {
    _id: 'usr_client',
    name: 'Acme Corp (Robert Taylor)',
    email: 'client@acmecorp.com',
    role: 'Client',
    department: 'Marketing',
  },
};

const mockProject = {
  _id: 'prj_1',
  title: 'Acme E-Commerce Redesign & SEO',
  clientId: 'usr_client',
  clientName: 'Acme Corp',
  status: 'In Progress',
  startDate: '2026-09-01',
  expectedDelivery: '2026-11-15',
  progressPercentage: 65,
  assignedTeam: ['usr_manager', 'usr_emp'],
};

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

const initialUser = getInitialUser();

const enforceDarkMode = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    localStorage.removeItem('crm_theme');
  }
  return 'dark';
};

enforceDarkMode();

export const useAppStore = create((set) => ({
  currentUser: initialUser,
  token: localStorage.getItem('token') || null,
  currentProject: mockProject,
  activeRole: initialUser ? initialUser.role : null,
  theme: 'dark',

  // Set user session
  setCurrentUser: (user, token) => {
    if (user) {
      localStorage.setItem('crm_user', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
      set({
        currentUser: user,
        activeRole: user.role,
        token: token || localStorage.getItem('token') || 'demo_jwt_token_2026',
      });
    }
  },

  // Set active project
  setCurrentProject: (project) => set({ currentProject: project }),

  // Switch role persona dynamically for testing UI layouts
  switchRole: (role) => {
    if (mockUsers[role]) {
      const user = mockUsers[role];
      localStorage.setItem('crm_user', JSON.stringify(user));
      localStorage.setItem('token', 'demo_jwt_token_2026');
      set({
        currentUser: user,
        activeRole: role,
        token: 'demo_jwt_token_2026',
      });
    }
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('crm_user');
    set({ currentUser: null, token: null, activeRole: null });
  },
}));
