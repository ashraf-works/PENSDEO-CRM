const mongoose = require('mongoose');
const Project = require('../models/Project');

/**
 * Utility to construct Mongoose query filter based on user role and resource type.
 * Core Philosophy:
 * - SuperAdmin / Manager: Full system access
 * - Employee: Scoped strictly to projects they are assigned to
 * - Client: Scoped strictly to projects where clientId matches their User ID AND only client-visible data (e.g. visibility === 'Visible to Client')
 */
const buildRoleFilter = async (user, resourceType, baseQuery = {}) => {
  if (!user) return baseQuery;

  const role = user.role;

  // 1. SuperAdmin and Manager have global system access
  if (role === 'SuperAdmin' || role === 'Manager') {
    return { ...baseQuery };
  }

  // 2. Fetch all project IDs associated with the user
  let userProjectIds = [];

  // Safely query database if MongoDB connection is established
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      if (role === 'Client') {
        const clientProjects = await Project.find({ clientId: user._id }).select('_id');
        userProjectIds = clientProjects.map((p) => p._id);
      } else if (role === 'Employee') {
        const empProjects = await Project.find({ assignedTeam: user._id }).select('_id');
        userProjectIds = empProjects.map((p) => p._id);
      }
    } catch (err) {
      console.warn('Database query skipped in scopeMiddleware:', err.message);
    }
  }

  // Fallback / merge with explicitly assigned projects in User document
  if (user.assignedProjects && user.assignedProjects.length > 0) {
    userProjectIds = [
      ...new Set([...userProjectIds.map(String), ...user.assignedProjects.map(String)]),
    ];
  }

  // 3. Apply Resource-Specific Scoping
  switch (resourceType) {
    case 'Project':
      if (role === 'Client') {
        return {
          ...baseQuery,
          $or: [{ clientId: user._id }, { _id: { $in: userProjectIds } }],
        };
      }
      if (role === 'Employee') {
        return {
          ...baseQuery,
          $or: [{ assignedTeam: user._id }, { _id: { $in: userProjectIds } }],
        };
      }
      break;

    case 'Task':
      if (role === 'Client') {
        return {
          ...baseQuery,
          projectId: { $in: userProjectIds },
        };
      }
      if (role === 'Employee') {
        return {
          ...baseQuery,
          $or: [{ assignedTo: user._id }, { projectId: { $in: userProjectIds } }],
        };
      }
      break;

    case 'DailyUpdate':
      if (role === 'Client') {
        // CRUCIAL REQUIREMENT:
        // Client ONLY sees updates where visibility === 'Visible to Client' AND belongs to their project
        return {
          ...baseQuery,
          visibility: 'Visible to Client',
          projectId: { $in: userProjectIds },
        };
      }
      if (role === 'Employee') {
        return {
          ...baseQuery,
          $or: [{ employeeId: user._id }, { projectId: { $in: userProjectIds } }],
        };
      }
      break;

    case 'Deliverable':
      if (role === 'Client' || role === 'Employee') {
        return {
          ...baseQuery,
          projectId: { $in: userProjectIds },
        };
      }
      break;

    default:
      break;
  }

  return baseQuery;
};

/**
 * Express middleware that attaches req.roleFilter to req object
 */
const scopeQuery = (resourceType) => {
  return async (req, res, next) => {
    try {
      req.roleFilter = await buildRoleFilter(req.user, resourceType, req.query || {});
      next();
    } catch (error) {
      console.error('Scope Middleware Error:', error);
      res.status(500).json({ error: 'Failed to apply data access scoping filters.' });
    }
  };
};

module.exports = { buildRoleFilter, scopeQuery };
