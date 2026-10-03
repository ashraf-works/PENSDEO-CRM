// Centralized User & Client Storage Utility for CRM

export const defaultMockUsers = [
  { _id: 'usr_1', name: 'Alex Vance', email: 'admin@agency.com', role: 'SuperAdmin', departmentNames: ['Development'] },
  { _id: 'usr_2', name: 'Sarah Jenkins', email: 'sarah@agency.com', role: 'Manager', departmentNames: ['Design'] },
  { _id: 'usr_3', name: 'David Miller', email: 'david@agency.com', role: 'Employee', departmentNames: ['Development'] },
  { _id: 'usr_4', name: 'Elena Rostova', email: 'elena@agency.com', role: 'Employee', departmentNames: ['SEO'] },
  { _id: 'usr_5', name: 'Acme Corp (Robert Taylor)', email: 'client@acmecorp.com', role: 'Client', departmentNames: ['Marketing'] },
];

/**
 * Reads local storage users list, falling back to defaultMockUsers if empty
 */
export const getStoredUsers = () => {
  try {
    const saved = localStorage.getItem('pensdeo_users');
    if (!saved) {
      localStorage.setItem('pensdeo_users', JSON.stringify(defaultMockUsers));
      return defaultMockUsers;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMockUsers;
  } catch (e) {
    return defaultMockUsers;
  }
};

/**
 * Saves or updates a single user object in local storage
 */
export const saveUserToStorage = (user) => {
  if (!user) return null;
  const currentList = getStoredUsers();

  const userId = user._id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const userName = user.name || (user.email ? user.email.split('@')[0] : 'Client Account');

  const normalizedUser = {
    ...user,
    _id: userId,
    name: userName,
    email: user.email || `${userName.toLowerCase().replace(/\s+/g, '')}@agency.com`,
    role: user.role || 'Client',
    departmentNames: user.departmentNames || ['Marketing'],
  };

  const existingIdx = currentList.findIndex(
    (u) => (u._id && u._id === normalizedUser._id) || (u.email && u.email === normalizedUser.email)
  );

  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...normalizedUser };
  } else {
    updatedList = [normalizedUser, ...currentList];
  }

  try {
    localStorage.setItem('pensdeo_users', JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to write users to storage:', e);
  }

  return normalizedUser;
};

/**
 * Saves a full array of users to local storage
 */
export const saveUsersListToStorage = (usersList) => {
  try {
    if (Array.isArray(usersList)) {
      localStorage.setItem('pensdeo_users', JSON.stringify(usersList));
    }
  } catch (e) {
    console.error('Failed to save users list:', e);
  }
};

/**
 * Merges server users response with locally stored users to ensure any locally created/invited clients persist
 */
export const mergeUsersWithStorage = (serverUsers) => {
  const localUsers = getStoredUsers();
  if (!Array.isArray(serverUsers) || serverUsers.length === 0) {
    return localUsers;
  }

  const serverIdSet = new Set(serverUsers.map((u) => u._id || u.email));
  const uniqueLocalOnly = localUsers.filter(
    (u) => !serverIdSet.has(u._id) && !serverIdSet.has(u.email)
  );

  const merged = [...serverUsers, ...uniqueLocalOnly];
  saveUsersListToStorage(merged);
  return merged;
};

/**
 * Helper to get all clients (case-insensitive role check)
 */
export const filterClients = (usersList) => {
  const list = Array.isArray(usersList) && usersList.length > 0 ? usersList : getStoredUsers();
  const clients = list.filter((u) => u.role && u.role.toLowerCase() === 'client');
  if (clients.length === 0) {
    // Ensure Acme Corp fallback if no clients match
    return [{ _id: 'usr_5', name: 'Acme Corp (Robert Taylor)', email: 'client@acmecorp.com', role: 'Client' }];
  }
  return clients;
};
