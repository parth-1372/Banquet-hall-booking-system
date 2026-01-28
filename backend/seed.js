/**
 * Seed script to create test users for the Netlarx Banquet Hall System.
 * Run this script once to populate the database with admin and customer accounts.
 * 
 * Usage: node seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./config/env');

// Connect to MongoDB
mongoose.connect(env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected for Seeding'))
    .catch(err => { console.error('❌ MongoDB Connection Error:', err.message); process.exit(1); });

const User = require('./models/User');
const Hall = require('./models/Hall');

const seedUsers = async () => {
    const userEmails = [
        'superadmin@netlarx.com',
        'admin2@netlarx.com',
        'admin1@netlarx.com',
        'customer@netlarx.com'
    ];

    // Delete existing test users to ensure fresh start
    await User.deleteMany({ email: { $in: userEmails } });
    console.log('🧹 Cleaned up existing test users.');

    const users = [
        {
            name: 'Super Admin',
            email: 'superadmin@netlarx.com',
            phone: '9999999999',
            password: 'admin123',
            role: 'super_admin',
            isActive: true,
        },
        {
            name: 'Operations Admin',
            email: 'admin2@netlarx.com',
            phone: '9999999998',
            password: 'admin123',
            role: 'admin2',
            isActive: true,
        },
        {
            name: 'Analysis Admin',
            email: 'admin1@netlarx.com',
            phone: '9999999997',
            password: 'admin123',
            role: 'admin1',
            isActive: true,
        },
        {
            name: 'Test Customer',
            email: 'customer@netlarx.com',
            phone: '9999999996',
            password: 'password123',
            role: 'customer',
            isActive: true,
        },
    ];

    for (const userData of users) {
        // Rely on User model pre-save hook for hashing
        const user = await User.create(userData);
        console.log(`✅ Created user: ${user.email} (${user.role}), Hash: ${user.password.substring(0, 10)}...`);
    }
    console.log('\n🎉 All test users seeded successfully!');
};

const seedHalls = async () => {
    const existingHall = await Hall.findOne({ name: 'The Grand Ballroom' });
    if (existingHall) {
        console.log('⚠️ Halls already exist. Skipping hall seeding.');
        return;
    }

    // Get a superadmin user to set as createdBy
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
        console.log('⚠️ SuperAdmin not found. Skipping hall seeding.');
        return;
    }

    const sampleHalls = [
        {
            name: 'The Grand Ballroom',
            description: 'An opulent ballroom with crystal chandeliers, marble floors, and space for up to 800 guests. Perfect for weddings and corporate galas.',
            type: 'banquet',
            amenities: ['AC', 'Stage', 'Valet Parking', 'Catering', 'DJ Setup', 'Bridal Room'],
            capacity: { minimum: 100, maximum: 800 },
            pricing: { morning: 50000, afternoon: 60000, evening: 80000, fullDay: 150000 },
            location: { address: '123 Luxury Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
            contactInfo: { email: 'grand@netlarx.com', phone: '9876543210' },
            images: [{ url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800', caption: 'Main Hall', isPrimary: true }],
            isActive: true,
            isFeatured: true,
            createdBy: superAdmin._id,
        },
        {
            name: 'Crystal Conference Hall',
            description: 'A state-of-the-art conference hall equipped with the latest audio-visual technology, ideal for corporate meetings and seminars.',
            type: 'conference',
            amenities: ['AC', 'Projector', 'Video Conferencing', 'WiFi', 'Whiteboard', 'Coffee Machine'],
            capacity: { minimum: 50, maximum: 300 },
            pricing: { morning: 25000, afternoon: 30000, evening: 35000, fullDay: 75000 },
            location: { address: '456 Business Park', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
            contactInfo: { email: 'conference@netlarx.com', phone: '9876543211' },
            images: [{ url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800', caption: 'Conference Room', isPrimary: true }],
            isActive: true,
            isFeatured: true,
            createdBy: superAdmin._id,
        },
        {
            name: 'Skyview Terrace',
            description: 'An open-air rooftop venue with stunning city skyline views, perfect for cocktail parties and intimate gatherings.',
            type: 'party',
            amenities: ['Open Air', 'Bar Setup', 'Lighting', 'Sound System', 'Heating'],
            capacity: { minimum: 30, maximum: 150 },
            pricing: { morning: 15000, afternoon: 20000, evening: 40000, fullDay: 60000 },
            location: { address: '789 Skyline Tower', city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
            contactInfo: { email: 'terrace@netlarx.com', phone: '9876543212' },
            images: [{ url: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=800', caption: 'Terrace View', isPrimary: true }],
            isActive: true,
            isFeatured: true,
            createdBy: superAdmin._id,
        },
    ];

    await Hall.insertMany(sampleHalls);
    console.log('✅ Sample halls seeded successfully!');
};

const runSeed = async () => {
    try {
        await seedUsers();
        await seedHalls();
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
    }
};

runSeed();
