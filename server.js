const mongoose = require('mongoose');
const dontenv = require('dotenv');
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
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port} `);
});
