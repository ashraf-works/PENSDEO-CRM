const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for JSON HTTP requests
const request = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API Request Failed');
    }
    return data;
  } catch (error) {
    console.warn(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

// Helper for Multipart FormData HTTP requests (File Uploads)
const requestFormData = async (endpoint, method = 'POST', formData, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'FormData Upload Failed');
    }
    return data;
  } catch (error) {
    console.warn(`FormData API Error (${endpoint}):`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', 'POST', credentials),
  getMe: (token) => request('/auth/me', 'GET', null, token),
  changePassword: (passData, token) => request('/auth/change-password', 'POST', passData, token),

  // Users & Advanced Filtering
  getUsers: (token, params = {}) => {
    const query = new URLSearchParams();
    if (params.role && params.role !== 'All') query.append('role', params.role);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/users${queryString}`, 'GET', null, token);
  },
  createUser: (userData, token) => request('/users', 'POST', userData, token),
  updateUser: (id, userData, token) => request(`/users/${id}`, 'PUT', userData, token),
  inviteUser: (inviteData, token) => request('/users/invite', 'POST', inviteData, token),
  resetUserPassword: (id, resetData, token) => request(`/users/${id}/reset-password`, 'POST', resetData, token),

  // Dynamic Departments
  getDepartments: (token) => request('/departments', 'GET', null, token),
  createDepartment: (deptData, token) => request('/departments', 'POST', deptData, token),
  updateDepartment: (id, deptData, token) => request(`/departments/${id}`, 'PUT', deptData, token),
  deleteDepartment: (id, token) => request(`/departments/${id}`, 'DELETE', null, token),

  // Projects
  getProjects: (token) => request('/projects', 'GET', null, token),
  createProject: (projectData, token) => request('/projects', 'POST', projectData, token),
  createProjectFormData: (formData, token) => requestFormData('/projects', 'POST', formData, token),
  updateProject: (id, projectData, token) => request(`/projects/${id}`, 'PUT', projectData, token),
  updateProjectFormData: (id, formData, token) => requestFormData(`/projects/${id}`, 'PUT', formData, token),
  deleteProject: (id, token) => request(`/projects/${id}`, 'DELETE', null, token),
  calculateProjectProgress: (projectId, token) =>
    request(`/projects/${projectId}/calculate-progress`, 'POST', null, token),

  // Tasks
  getTasks: (token) => request('/tasks', 'GET', null, token),
  createTask: (taskData, token) => request('/tasks', 'POST', taskData, token),
  createTaskFormData: (formData, token) => requestFormData('/tasks', 'POST', formData, token),
  updateTask: (id, taskData, token) => request(`/tasks/${id}`, 'PUT', taskData, token),
  updateTaskFormData: (id, formData, token) => requestFormData(`/tasks/${id}`, 'PUT', formData, token),
  updateTaskStatus: (taskId, status, token) =>
    request(`/tasks/${taskId}/status`, 'PATCH', { status }, token),
  deleteTask: (id, token) => request(`/tasks/${id}`, 'DELETE', null, token),

  // Daily Updates & Manager Review
  getDailyUpdates: (token) => request('/daily-updates', 'GET', null, token),
  createDailyUpdate: (updateData, token) => request('/daily-updates', 'POST', updateData, token),
  createDailyUpdateFormData: (formData, token) => requestFormData('/daily-updates', 'POST', formData, token),
  submitManagerReview: (updateId, reviewData, token) =>
    request(`/daily-updates/${updateId}/manager-review`, 'PATCH', reviewData, token),
  toggleVisibility: (updateId, visibility, token) =>
    request(`/daily-updates/${updateId}/visibility`, 'PATCH', { visibility }, token),

  // Deliverables
  getDeliverables: (token) => request('/deliverables', 'GET', null, token),
  createDeliverable: (deliverableData, token) => request('/deliverables', 'POST', deliverableData, token),
  submitClientReview: (deliverableId, reviewData, token) =>
    request(`/deliverables/${deliverableId}/client-review`, 'PATCH', reviewData, token),
};
