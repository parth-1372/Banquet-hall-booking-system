const mongoose = require('mongoose');
const env = require('./config/env');
const User = require('./models/User');

mongoose.connect(env.MONGODB_URI)
    .then(async () => {
        const users = await User.find({}, 'email role password');
        console.log('Total Users:', users.length);
        users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}, HashStart: ${u.password ? u.password.substring(0, 10) : 'none'}`));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
