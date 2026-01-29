const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Hall = require('./models/Hall');
const Booking = require('./models/Booking');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing data)
        await Hall.deleteMany({});
        await Booking.deleteMany({});
        console.log('🗑️  Cleared existing halls and bookings');

        // Ensure users exist
        let customer = await User.findOne({ email: 'customer@test.com' });
        let admin1 = await User.findOne({ email: 'admin1@test.com' });
        let admin2 = await User.findOne({ email: 'admin2@test.com' });
        let superadmin = await User.findOne({ email: 'superadmin@test.com' });

        // Create users if they don't exist
        if (!customer) {
            customer = await User.create({
                name: 'John Customer',
                email: 'customer@test.com',
                password: 'password123',
                role: 'customer',
                phone: '9876543210'
            });
        }

        if (!admin1) {
            admin1 = await User.create({
                name: 'Admin One',
                email: 'admin1@test.com',
                password: 'password123',
                role: 'admin1',
                phone: '9876543211'
            });
        }

        if (!admin2) {
            admin2 = await User.create({
                name: 'Admin Two',
                email: 'admin2@test.com',
                password: 'password123',
                role: 'admin2',
                phone: '9876543212'
            });
        }

        if (!superadmin) {
            superadmin = await User.create({
                name: 'Super Admin',
                email: 'superadmin@test.com',
                password: 'password123',
                role: 'super_admin',
                phone: '9876543213'
            });
        }

        console.log('✅ Users ready');

        // ========================================
        // CREATE 5 HALLS WITH HIGH-QUALITY DATA
        // ========================================

        const halls = await Hall.create([
            {
                name: 'Grand Crystal Ballroom',
                description: 'An opulent ballroom featuring soaring ceilings with magnificent crystal chandeliers, marble floors, and floor-to-ceiling windows. Perfect for luxury weddings and high-profile galas.',
                type: 'wedding',
                capacity: { minimum: 100, maximum: 500 },
                pricing: { morning: 40000, afternoon: 40000, evening: 70000, fullDay: 150000 },
                amenities: ['AC', 'Parking', 'Catering', 'Stage', 'Sound System', 'Lighting', 'Decoration', 'Valet Parking', 'Bridal Room'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1519167758481-83f29da8c6d0?w=800', caption: 'Main Hall', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', caption: 'Entrance' },
                    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', caption: 'Decor' }
                ],
                location: {
                    address: 'Bandra West',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400050'
                },
                contactInfo: {
                    phone: '9876543210',
                    email: 'crystal@example.com'
                },
                createdBy: superadmin._id,
                rotationViewUrl: 'https://pannellum.org/images/alma.jpg',
                isActive: true,
                isFeatured: true
            },
            {
                name: 'Tech Conference Center',
                description: 'State-of-the-art conference facility with modular seating, advanced AV equipment, high-speed WiFi, and dedicated breakout rooms. Ideal for corporate events, seminars, and product launches.',
                type: 'conference',
                capacity: { minimum: 50, maximum: 300 },
                pricing: { morning: 20000, afternoon: 20000, evening: 40000, fullDay: 80000 },
                amenities: ['AC', 'Parking', 'WiFi', 'Projector', 'Sound System', 'Video Conferencing', 'Podium', 'Green Room'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', caption: 'Conference Room', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1561489396-888724a1543d?w=800', caption: 'Lobby' },
                    { url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800', caption: 'Seating' }
                ],
                location: {
                    address: 'Whitefield',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    pincode: '560066'
                },
                contactInfo: {
                    phone: '9876543211',
                    email: 'tech@example.com'
                },
                createdBy: superadmin._id,
                rotationViewUrl: 'https://pannellum.org/images/cerro-toco-0.jpg',
                isActive: true,
                isFeatured: true
            },
            {
                name: 'Garden Pavilion Estate',
                description: 'Enchanting outdoor venue surrounded by lush gardens, water fountains, and romantic gazebos. Features both covered pavilion and open lawn areas for versatile event setup.',
                type: 'wedding',
                capacity: { minimum: 200, maximum: 600 },
                pricing: { morning: 50000, afternoon: 50000, evening: 100000, fullDay: 200000 },
                amenities: ['AC Tents', 'Parking', 'Catering', 'DJ', 'Lighting', 'Decoration', 'Generator Backup', 'Lawn'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', caption: 'Garden View', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', caption: 'Evening Setup' },
                    { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', caption: 'Pavilion' }
                ],
                location: {
                    address: 'Chattarpur',
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110074'
                },
                contactInfo: {
                    phone: '9876543212',
                    email: 'garden@example.com'
                },
                createdBy: superadmin._id,
                rotationViewUrl: 'https://pannellum.org/images/bma-0.jpg',
                isActive: true,
                isFeatured: false
            },
            {
                name: 'Royal Palace Hall',
                description: 'Heritage venue with regal architecture, ornate pillars, and traditional Indian decor. A majestic setting for weddings, receptions, and cultural celebrations.',
                type: 'wedding',
                capacity: { minimum: 150, maximum: 400 },
                pricing: { morning: 45000, afternoon: 45000, evening: 90000, fullDay: 180000 },
                amenities: ['AC', 'Parking', 'Catering', 'Traditional Decor', 'Stage', 'Sound System', 'Heritage Architecture'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', caption: 'Palace Hall', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', caption: 'Interior' },
                    { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', caption: 'Courtyard' }
                ],
                location: {
                    address: 'Civil Lines',
                    city: 'Jaipur',
                    state: 'Rajasthan',
                    pincode: '302006'
                },
                contactInfo: {
                    phone: '9876543213',
                    email: 'royal@example.com'
                },
                createdBy: superadmin._id,
                rotationViewUrl: 'https://pannellum.org/images/from-tree.jpg',
                isActive: true,
                isFeatured: true
            },
            {
                name: 'Skyline Rooftop Venue',
                description: 'Contemporary rooftop space with panoramic city views, modern minimalist design, and ambient lighting. Perfect for cocktail parties, corporate mixers, and evening receptions.',
                type: 'party',
                capacity: { minimum: 50, maximum: 200 },
                pricing: { morning: 25000, afternoon: 25000, evening: 50000, fullDay: 100000 },
                amenities: ['AC Lounge', 'Parking', 'Bar', 'DJ', 'Lighting', 'City Views', 'Outdoor Seating'],
                images: [
                    { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800', caption: 'Rooftop View', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800', caption: 'Lounge' },
                    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', caption: 'Bar Area' }
                ],
                location: {
                    address: 'Lower Parel',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400013'
                },
                contactInfo: {
                    phone: '9876543214',
                    email: 'skyline@example.com'
                },
                createdBy: superadmin._id,
                rotationViewUrl: 'https://pannellum.org/images/examplepano.jpg',
                isActive: true,
                isFeatured: false
            }
        ]);

        console.log('✅ Created 5 halls with images and 360° views');

        // ========================================
        // CREATE 6 BOOKINGS IN DIFFERENT STATUSES
        // ========================================

        const today = new Date();
        const futureDate1 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        const futureDate2 = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days
        const futureDate3 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days

        const bookings = await Booking.create([
            // 1. ACTION PENDING
            {
                user: customer._id,
                halls: [halls[0]._id],
                eventDate: futureDate1,
                timeSlot: 'evening',
                guestCount: 350,
                eventType: 'Wedding Reception',
                specialRequests: 'Need red carpet and stage setup',
                status: 'action-pending',
                contactDetails: {
                    name: 'John Customer',
                    phone: '9876543210',
                    email: 'customer@test.com'
                },
                pricing: {
                    basePrice: 150000,
                    taxes: 0,
                    discount: 0,
                    totalAmount: 150000
                },
                workflow: {
                    admin1: { status: 'pending' },
                    admin2: { status: 'pending' },
                    admin3: { status: 'pending' }
                }
            },

            // 2. APPROVED-ADMIN1
            {
                user: customer._id,
                halls: [halls[1]._id],
                eventDate: futureDate2,
                timeSlot: 'morning',
                guestCount: 250,
                eventType: 'Corporate Seminar',
                specialRequests: 'Need projector and video conferencing setup',
                status: 'approved-admin1',
                contactDetails: {
                    name: 'John Customer',
                    phone: '9876543210',
                    email: 'customer@test.com'
                },
                pricing: {
                    basePrice: 80000,
                    taxes: 0,
                    discount: 0,
                    totalAmount: 80000
                },
                workflow: {
                    admin1: {
                        status: 'approved',
                        processedBy: admin1._id,
                        processedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
                        note: 'Documents verified. All clear.'
                    },
                    admin2: { status: 'pending' },
                    admin3: { status: 'pending' }
                }
            },

            // 3. PAYMENT-REQUESTED
            {
                user: customer._id,
                halls: [halls[2]._id],
                eventDate: futureDate3,
                timeSlot: 'full-day',
                guestCount: 500,
                eventType: 'Wedding Ceremony',
                specialRequests: 'Outdoor seating arrangement required',
                status: 'payment-requested',
                contactDetails: {
                    name: 'John Customer',
                    phone: '9876543210',
                    email: 'customer@test.com'
                },
                pricing: {
                    basePrice: 200000,
                    taxes: 0,
                    discount: 0,
                    totalAmount: 200000
                },
                workflow: {
                    admin1: {
                        status: 'approved',
                        processedBy: admin1._id,
                        processedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
                        note: 'Verified successfully'
                    },
                    admin2: {
                        status: 'payment-requested',
                        processedBy: admin2._id,
                        processedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
                        note: 'Hall available. Payment requested.'
                    },
                    admin3: { status: 'pending' }
                }
            },

            // 4. APPROVED-ADMIN2
            {
                user: customer._id,
                halls: [halls[3]._id],
                eventDate: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000),
                timeSlot: 'evening',
                guestCount: 400,
                eventType: 'Reception',
                specialRequests: 'Traditional setup with stage',
                status: 'approved-admin2',
                contactDetails: {
                    name: 'John Customer',
                    phone: '9876543210',
                    email: 'customer@test.com'
                },
                pricing: {
                    basePrice: 180000,
                    taxes: 0,
                    discount: 0,
                    totalAmount: 180000
                },
                workflow: {
                    admin1: {
                        status: 'approved',
                        processedBy: admin1._id,
                        processedAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
                        note: 'All documents verified'
                    },
                    admin2: {
                        status: 'approved',
                        processedBy: admin2._id,
                        processedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
                        note: 'Payment verified. Forwarding for final approval.'
                    },
                    admin3: { status: 'pending' }
                }
            },

            // 5. CONFIRMED
            {
                user: customer._id,
                halls: [halls[4]._id],
                eventDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000),
                timeSlot: 'evening',
                guestCount: 150,
                eventType: 'Corporate Party',
                specialRequests: 'DJ and cocktail setup',
                status: 'confirmed',
                contactDetails: {
                    name: 'John Customer',
                    phone: '9876543210',
                    email: 'customer@test.com'
                },
                pricing: {
                    basePrice: 100000,
                    taxes: 0,
                    discount: 0,
                    totalAmount: 100000
                },
                workflow: {
                    admin1: {
                        status: 'approved',
                        processedBy: admin1._id,
                        processedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
                        note: 'Verified'
                    },
                    admin2: {
                        status: 'approved',
                        processedBy: admin2._id,
                        processedAt: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
                        note: 'Payment complete'
                    },
                    admin3: {
                        status: 'approved',
                        processedBy: superadmin._id,
                        processedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
                        note: 'Final approval granted. Booking confirmed.'
                    }
                }
            },

            // 6. MULTI-HALL BOOKING
            {
                user: customer._id,
                halls: [halls[0]._id, halls[2]._id],
                eventDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
                timeSlot: 'full-day',
                guestCount: 800,
                eventType: 'Grand Wedding',
                specialRequests: 'Ceremony in garden, reception in ballroom',
                status: 'action-pending',
                contactDetails: {
                    name: 'John Customer',
                    phone: '9876543210',
                    email: 'customer@test.com'
                },
                pricing: {
                    basePrice: 350000,
                    taxes: 0,
                    discount: 0,
                    totalAmount: 350000
                },
                workflow: {
                    admin1: { status: 'pending' },
                    admin2: { status: 'pending' },
                    admin3: { status: 'pending' }
                }
            }
        ]);

        console.log('✅ Created 6 bookings in different statuses');

        console.log('\n🎉 DATABASE SEEDING COMPLETE!\n');
        console.log('='.repeat(50));
        console.log('📊 SUMMARY:');
        console.log('='.repeat(50));
        console.log(`✅ Halls created: ${halls.length}`);
        console.log(`✅ Bookings created: ${bookings.length}`);
        console.log('\n📋 BOOKING STATUSES:');
        console.log('   1. Action Pending (initial state)');
        console.log('   2. Approved Admin1 (after document verification)');
        console.log('   3. Payment Requested (after availability check)');
        console.log('   4. Approved Admin2 (payment verified, awaiting final)');
        console.log('   5. Confirmed (final approval completed)');
        console.log('   6. Multi-Hall Booking (demonstrates bulk booking)');
        console.log('\n🎥 READY FOR VIDEO RECORDING!');
        console.log('='.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

// Run the seeding
seedDatabase();
