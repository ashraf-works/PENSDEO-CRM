const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all users with advanced role & department filtering
// @route   GET /api/users
// @access  Private (SuperAdmin, Manager)
const getUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    let queryConditions = [];

    // 1. Advanced Role Filtering ($in)
    if (role && role !== 'All') {
      const rolesArray = typeof role === 'string'
        ? role.split(',').map((r) => r.trim()).filter(Boolean)
        : role;
      
      if (rolesArray.length > 0) {
        queryConditions.push({ role: { $in: rolesArray } });
      }
    }

    // 2. Advanced Department Filtering ($in)
    if (department && department !== 'All') {
      const deptArray = typeof department === 'string'
        ? department.split(',').map((d) => d.trim()).filter(Boolean)
        : department;

      if (deptArray.length > 0) {
        const objectIdMatches = deptArray.filter((id) => mongoose.Types.ObjectId.isValid(id));
        const nameMatches = deptArray.map((d) => new RegExp(`^${d}$`, 'i'));

        const foundDepts = await Department.find({
          $or: [
            { _id: { $in: objectIdMatches } },
            { name: { $in: nameMatches } },
          ],
        }).select('_id name');

        const resolvedDeptIds = foundDepts.map((d) => d._id);
        const resolvedDeptNames = foundDepts.map((d) => d.name);

        const allDeptIds = [...new Set([...objectIdMatches, ...resolvedDeptIds.map(String)])];
        const allDeptNames = [...new Set([...deptArray, ...resolvedDeptNames])];

        const deptRegexes = allDeptNames.map((n) => new RegExp(n, 'i'));

        queryConditions.push({
          $or: [
            { department: { $in: allDeptIds } },
            { departmentNames: { $in: deptRegexes } },
          ],
        });
      }
    }

    const finalFilter = queryConditions.length > 0 ? { $and: queryConditions } : {};

    const users = await User.find(finalFilter)
      .select('-password')
      .populate('department')
      .populate('assignedProjects');

    res.json(users);
  } catch (error) {
    console.error('getUsers API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update existing user (Role & Multiple Department Assignment)
// @route   PUT /api/users/:id
// @access  Private (SuperAdmin, Manager)
const updateUser = async (req, res) => {
  try {
    const { name, role, department, departmentNames } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) user.name = name;
    if (role) user.role = role;

    if (department) {
      user.department = Array.isArray(department) ? department : [department];
    }

    if (departmentNames) {
      user.departmentNames = Array.isArray(departmentNames) ? departmentNames : [departmentNames];
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('department')
      .populate('assignedProjects');

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Invite user and send role-specific invitation email
// @route   POST /api/users/invite
// @access  Private (SuperAdmin ONLY)
const inviteUser = async (req, res) => {
  try {
    const { email, name, role, department, departmentNames } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Please provide email and role.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists in system.' });
    }

    const tempPassword = crypto.randomBytes(4).toString('hex');

    let deptIds = [];
    let deptNames = [];
    if (department) {
      deptIds = Array.isArray(department) ? department : [department];
    }
    if (departmentNames) {
      deptNames = Array.isArray(departmentNames) ? departmentNames : [departmentNames];
    }

    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: tempPassword,
      role: role || 'Employee',
      department: deptIds,
      departmentNames: deptNames,
    });

    let subject = 'Invitation to join PENSDEO Workspace';
    let portalName = 'PENSDEO Workspace';
    let loginUrl = 'http://localhost:3000/login';

    if (role === 'Client') {
      subject = 'Invitation to PENSDEO Client Portal';
      portalName = 'PENSDEO Client Portal';
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 22px;">${portalName}</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Welcome to your transparent agency collaboration workspace</p>
        </div>
        
        <p style="font-size: 15px; leading-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
        
        ${
          role === 'Client'
            ? `<p style="font-size: 14px; color: #334155;">You have been officially invited to access your custom <strong>PENSDEO Client Portal</strong>. Here you can track real-time project progress, view verified daily activity updates, and review deliverables.</p>`
            : `<p style="font-size: 14px; color: #334155;">You have been invited to join <strong>PENSDEO Workspace</strong> as a <strong>${user.role}</strong>.</p>`
        }

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Credentials</span>
          <div style="margin-top: 8px; font-size: 14px;">
            <div><strong>Login Email:</strong> ${user.email}</div>
            <div style="margin-top: 4px;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; color: #4f46e5; font-weight: bold;">${tempPassword}</code></div>
          </div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
            Sign In to ${portalName}
          </a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
          Please log in and update your password immediately upon your first sign-in.
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject,
      html,
    });

    res.status(201).json({
      message: `Invitation successfully sent to ${email}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        departmentNames: user.departmentNames,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new user directly (with username, name, password, email, role, department)
// @route   POST /api/users
// @access  Private (SuperAdmin, Manager)
const createUser = async (req, res) => {
  try {
    const { name, username, email, password, role, department, departmentNames } = req.body;

    if (!name || (!email && !username) || !password) {
      return res.status(400).json({ error: 'Please provide name, email or username, and password.' });
    }

    const userEmail = email || (username ? `${username}@agency.com` : `user_${Date.now()}@agency.com`);

    const userExists = await User.findOne({
      $or: [{ email: userEmail.toLowerCase() }, ...(username ? [{ username: username.toLowerCase() }] : [])],
    });

    if (userExists) {
      return res.status(400).json({ error: 'User with this email or username already exists.' });
    }

    let deptIds = [];
    let deptNames = [];
    if (department) {
      deptIds = Array.isArray(department) ? department : [department];
    }
    if (departmentNames) {
      deptNames = Array.isArray(departmentNames) ? departmentNames : [departmentNames];
    }

    const user = await User.create({
      name,
      username: username ? username.toLowerCase() : userEmail.split('@')[0],
      email: userEmail.toLowerCase(),
      password,
      role: role || 'Employee',
      department: deptIds,
      departmentNames: deptNames,
    });

    const createdUser = await User.findById(user._id)
      .select('-password')
      .populate('department');

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Admin reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private (SuperAdmin, Manager)
const adminResetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const tempPassword = newPassword || crypto.randomBytes(4).toString('hex');
    user.password = tempPassword;
    await user.save();

    // Send email notification to user about password reset
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Notice - PENSDEO Workspace',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <h2 style="color: #4f46e5; margin-top: 0;">PENSDEO Workspace</h2>
            <p style="font-size: 14px;">Your password has been reset by an Administrator.</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; margin: 20px 0;">
              <span style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">New Password</span>
              <div style="margin-top: 8px; font-size: 14px;">
                <div><strong>Email:</strong> ${user.email}</div>
                <div style="margin-top: 4px;"><strong>New Password:</strong> <code style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; color: #4f46e5; font-weight: bold;">${tempPassword}</code></div>
              </div>
            </div>
            <p style="font-size: 12px; color: #64748b;">Please log in and change your password if needed.</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn('Could not dispatch password reset email:', e.message);
    }

    res.json({
      message: `Password for ${user.name} (${user.email}) has been reset successfully.`,
      tempPassword,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  inviteUser,
  adminResetPassword,
};

