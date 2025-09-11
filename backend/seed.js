import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Company from './models/Company.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});

    // Create TPO Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'TPO Admin',
      email: 'tpo@mbm.ac.in',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();

    // Create sample companies
    const companies = [
      {
        name: 'TCS',
        jobRole: 'Software Developer',
        package: { ctc: 3.5, base: 3.2, variable: 0.3 },
        eligibility: {
          minCGPA: 6.0,
          allowedBranches: ['CSE', 'IT', 'ECE'],
          graduationYear: ['2024', '2025'],
          maxBacklogs: 2
        },
        applicationDeadline: new Date('2024-12-31'),
        visitDate: new Date('2024-12-15'),
        description: 'Leading IT services company looking for talented developers',
        addedBy: admin._id,
        selectionProcess: ['Online Test', 'Technical Interview', 'HR Interview']
      },
      {
        name: 'Infosys',
        jobRole: 'Systems Engineer',
        package: { ctc: 4.0, base: 3.6, variable: 0.4 },
        eligibility: {
          minCGPA: 6.5,
          allowedBranches: ['CSE', 'IT', 'ECE', 'EEE'],
          graduationYear: ['2024', '2025'],
          maxBacklogs: 1
        },
        applicationDeadline: new Date('2024-12-25'),
        visitDate: new Date('2024-12-20'),
        description: 'Global technology services company seeking fresh graduates',
        addedBy: admin._id,
        selectionProcess: ['Aptitude Test', 'Technical Interview', 'HR Round']
      },
      {
        name: 'Wipro',
        jobRole: 'Project Engineer',
        package: { ctc: 3.8, base: 3.4, variable: 0.4 },
        eligibility: {
          minCGPA: 6.0,
          allowedBranches: ['ALL'],
          graduationYear: ['2024', '2025'],
          maxBacklogs: 2
        },
        applicationDeadline: new Date('2024-12-28'),
        visitDate: new Date('2024-12-18'),
        description: 'Digital transformation company hiring across all branches',
        addedBy: admin._id,
        selectionProcess: ['Written Test', 'Group Discussion', 'Technical Interview', 'HR Interview']
      }
    ];

    await Company.insertMany(companies);

    console.log('✅ Sample data seeded successfully!');
    console.log('📧 Admin Login: tpo@mbm.ac.in');
    console.log('🔑 Admin Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();