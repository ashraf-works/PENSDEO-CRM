// Centralized Project Storage Utility for CRM

export const defaultMockProjects = [
  {
    _id: 'prj_1',
    title: 'Acme E-Commerce Redesign & SEO',
    clientId: { _id: 'usr_5', name: 'Acme Corp (Robert Taylor)', email: 'client@acmecorp.com' },
    status: 'In Progress',
    startDate: '2026-09-01',
    expectedDelivery: '2026-11-15',
    progressPercentage: 65,
  },
];

/**
 * Reads stored projects from local storage, falling back to defaultMockProjects if empty
 */
export const getStoredProjects = () => {
  try {
    const saved = localStorage.getItem('pensdeo_projects');
    if (!saved) {
      localStorage.setItem('pensdeo_projects', JSON.stringify(defaultMockProjects));
      return defaultMockProjects;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMockProjects;
  } catch (e) {
    return defaultMockProjects;
  }
};

/**
 * Saves or updates a single project object in local storage
 */
export const saveProjectToStorage = (project) => {
  if (!project) return null;
  const currentList = getStoredProjects();

  const projectId = project._id || `prj_${Date.now()}`;
  const normalizedProject = {
    ...project,
    _id: projectId,
    title: project.title || 'Untitled Project',
    status: project.status || 'Planning',
  };

  const existingIdx = currentList.findIndex(
    (p) => (p._id && p._id === normalizedProject._id) || (p.title && p.title === normalizedProject.title)
  );

  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...normalizedProject };
  } else {
    updatedList = [normalizedProject, ...currentList];
  }

  try {
    localStorage.setItem('pensdeo_projects', JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed to write project to storage:', e);
  }

  return normalizedProject;
};

/**
 * Saves a full array of projects to local storage
 */
export const saveProjectsListToStorage = (projectsList) => {
  try {
    if (Array.isArray(projectsList)) {
      localStorage.setItem('pensdeo_projects', JSON.stringify(projectsList));
    }
  } catch (e) {
    console.error('Failed to save projects list:', e);
  }
};

/**
 * Merges server projects response with locally stored projects to ensure any locally created projects persist
 */
export const mergeProjectsWithStorage = (serverProjects) => {
  const localProjects = getStoredProjects();
  if (!Array.isArray(serverProjects) || serverProjects.length === 0) {
    return localProjects;
  }

  const serverIdSet = new Set(serverProjects.map((p) => p._id || p.title));
  const uniqueLocalOnly = localProjects.filter(
    (p) => !serverIdSet.has(p._id) && !serverIdSet.has(p.title)
  );

  const merged = [...serverProjects, ...uniqueLocalOnly];
  saveProjectsListToStorage(merged);
  return merged;
};
