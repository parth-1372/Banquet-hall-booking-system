const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Start the server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start listening
        const server = app.listen(env.PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏛️  Banquet Hall Booking System API                      ║
║                                                            ║
║   Server running in ${env.NODE_ENV.padEnd(12)} mode                  ║
║   Listening on port ${String(env.PORT).padEnd(5)}                              ║
║   API URL: http://localhost:${env.PORT}                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('UNHANDLED REJECTION! 💥 Shutting down...');
            console.error(err.name, err.message);
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle SIGTERM
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
            server.close(() => {
                console.log('💥 Process terminated!');
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
