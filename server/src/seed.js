const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const DailyUpdate = require('./models/DailyUpdate');
const Deliverable = require('./models/Deliverable');

dotenv.config();

const seedDB = async (shouldExit = true) => {
  try {
    if (shouldExit) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agency_crm');
      console.log('Connected to MongoDB for seeding...');
    }

    // Clear existing collections
    const Department = require('./models/Department');
    await Department.deleteMany({});
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await DailyUpdate.deleteMany({});
    await Deliverable.deleteMany({});

    console.log('Cleared previous database entries.');

    // 0. Create Departments
    const devDept = await Department.create({ name: 'Development', description: 'Engineering & Web Development' });
    const designDept = await Department.create({ name: 'Design', description: 'UI/UX & Branding' });
    const seoDept = await Department.create({ name: 'SEO', description: 'Search Engine Optimization & Content' });
    const mktDept = await Department.create({ name: 'Marketing', description: 'Digital Marketing & Strategy' });

    console.log('Departments created.');

    // 1. Create Users (SuperAdmin, Manager, Employee, Client)
    const admin = await User.create({
      name: 'Alex Vance',
      email: 'admin@agency.com',
      password: 'password123',
      role: 'SuperAdmin',
      department: [devDept._id],
      departmentNames: ['Development'],
    });

    const manager = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@agency.com',
      password: 'password123',
      role: 'Manager',
      department: [designDept._id],
      departmentNames: ['Design'],
    });

    const devEmp = await User.create({
      name: 'David Miller',
      email: 'david@agency.com',
      password: 'password123',
      role: 'Employee',
      department: [devDept._id],
      departmentNames: ['Development'],
    });

    const seoEmp = await User.create({
      name: 'Elena Rostova',
      email: 'elena@agency.com',
      password: 'password123',
      role: 'Employee',
      department: [seoDept._id],
      departmentNames: ['SEO'],
    });

    const client = await User.create({
      name: 'Acme Corp (Robert Taylor)',
      email: 'client@acmecorp.com',
      password: 'password123',
      role: 'Client',
      department: [mktDept._id],
      departmentNames: ['Marketing'],
    });

    console.log('Users created.');

    // 2. Create Project (Client -> Project)
    const project = await Project.create({
      title: 'Acme E-Commerce Redesign & SEO',
      clientId: client._id,
      status: 'In Progress',
      startDate: new Date('2026-09-01'),
      expectedDelivery: new Date('2026-11-15'),
      progressPercentage: 65,
      assignedTeam: [manager._id, devEmp._id, seoEmp._id],
    });

    // Link project to client
    client.assignedProjects.push(project._id);
    await client.save();

    console.log('Project created & assigned to Client.');

    // 3. Create Tasks (Project -> Task)
    const task1 = await Task.create({
      title: 'Build Responsive Checkout Component',
      projectId: project._id,
      assignedTo: devEmp._id,
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date('2026-10-05'),
      comments: [
        { user: manager._id, text: 'Ensure Stripe elements are cleanly styled.' },
        { user: devEmp._id, text: 'Working on mobile webhooks integration.' },
      ],
    });

    const task2 = await Task.create({
      title: 'On-Page SEO Technical Audit',
      projectId: project._id,
      assignedTo: seoEmp._id,
      status: 'Internal Review',
      priority: 'Medium',
      dueDate: new Date('2026-10-02'),
      comments: [
        { user: seoEmp._id, text: 'Completed sitemap analysis and meta descriptions.' },
      ],
    });

    console.log('Tasks created.');

    // 4. Create DailyUpdates (Employee logs work, Admin controls visibility)
    await DailyUpdate.create({
      projectId: project._id,
      taskId: task1._id,
      employeeId: devEmp._id,
      description: 'Integrated Stripe API SDK and optimized cart calculation logic.',
      timeSpent: 240, // 4 hours
      visibility: 'Visible to Client',
    });

    await DailyUpdate.create({
      projectId: project._id,
      taskId: task1._id,
      employeeId: devEmp._id,
      description: 'Debugged internal CORS issue with backend gateway.',
      timeSpent: 90, // 1.5 hours
      visibility: 'Internal Only', // Admin keeps internal dev details hidden
    });

    await DailyUpdate.create({
      projectId: project._id,
      taskId: task2._id,
      employeeId: seoEmp._id,
      description: 'Fixed schema markup errors and published SEO audit report.',
      timeSpent: 180,
      visibility: 'Visible to Client',
    });

    console.log('Daily Updates created.');

    // 5. Create Deliverables (Project -> Deliverable)
    await Deliverable.create({
      projectId: project._id,
      title: 'UI Design System Figma Prototype v2.0',
      fileUrl: 'https://figma.com/file/acme-design-system-v2',
      type: 'Design',
      status: 'Approved',
      clientFeedback: 'Looks amazing! Love the modern dark glassmorphism aesthetic.',
    });

    await Deliverable.create({
      projectId: project._id,
      title: 'SEO Strategy & Competitor Analysis Report Q4',
      fileUrl: 'https://storage.agency.com/deliverables/seo-audit-acme.pdf',
      type: 'Report',
      status: 'Pending Review',
      clientFeedback: '',
    });

    console.log('Deliverables created.');
    console.log('Database Seeding Completed Successfully!');
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding Error:', error);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDB(true);
}

module.exports = seedDB;

