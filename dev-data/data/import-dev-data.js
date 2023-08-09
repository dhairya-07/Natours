require('dotenv').config({ path: './config.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const Tours = require('../../models/tourSchema');

const DB_URL = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

console.log(process.argv);
const data = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

const importData = async () => {
  try {
    await Tours.create(data);
    console.log('Data successfully imported');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tours.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

async function connect() {
  try {
    await mongoose.connect(DB_URL);
    if (process.argv[2] === '--import') {
      importData();
    } else if (process.argv[2] === '--delete') {
      deleteData();
    }
  } catch (err) {
    console.log(err);
  }
}
connect();
