const mongoose = require('mongoose');
const dontenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught exception. Shutting down...');
  process.exit(1);
});

// Connecting the current process with the config.env file(containing enviromental variables)
dontenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('Connection successful');
  });

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} `);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejction. Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
