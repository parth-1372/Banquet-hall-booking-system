const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./config/env');
const User = require('./models/User');

mongoose.connect(env.MONGODB_URI)
    .then(async () => {
        const user = await User.findOne({ email: 'customer@netlarx.com' }).select('+password');
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }
        console.log('Role:', user.role);
        const isMatch = await bcrypt.compare('password123', user.password);
        console.log('Password "password123" match:', isMatch);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
