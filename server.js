require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const { PORT } = process.env;

const DB_URL = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB_URL)
  .then(() => console.log('Database connected'))
  .catch((err) => {
    throw err;
  });

const server = app.listen(PORT, () => {
  console.log(`Server started on port:`, PORT);
});

process.on('unhandledRejection', (reason) => {
  console.log('UNHANDLED REJECTION!💥 SHUTTING DOWN...');
  console.log(reason.name, reason.message);
  server.close(() => {
    process.exit(1);
  });
});
