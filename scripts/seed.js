require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../managers/entities/user/user.model');

const seedSuperadmin = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/school_management';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check if superadmin already exists
        const existingSuperadmin = await User.findOne({ role: 'superadmin' });
        if (existingSuperadmin) {
            console.log('Superadmin already exists:', existingSuperadmin.email);
            process.exit(0);
        }

        // Get superadmin details from environment or use defaults
        const name = process.env.SEED_SUPERADMIN_NAME || 'Super Admin';
        const email = process.env.SEED_SUPERADMIN_EMAIL || 'admin@schoolmanagement.com';
        const password = process.env.SEED_SUPERADMIN_PASSWORD || 'Admin123!';

        if (!process.env.SEED_SUPERADMIN_PASSWORD) {
            console.warn('Warning: Using default password. Set SEED_SUPERADMIN_PASSWORD in .env for production!');
        }

        // Create superadmin
        const superadmin = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: 'superadmin'
        });

        await superadmin.save();
        console.log('Superadmin created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding superadmin:', error);
        process.exit(1);
    }
};

// Run seed
seedSuperadmin();
