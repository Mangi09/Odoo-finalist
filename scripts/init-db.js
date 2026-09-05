require('dotenv').config();
const mongoose = require('mongoose');
const models = require('../models');

const initDatabase = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/odoo';
    console.log(`Connecting to MongoDB at ${connStr}...`);
    
    await mongoose.connect(connStr);
    console.log('Connected successfully!');

    // Initialize all collections for the schemas defined in models/
    const modelKeys = Object.keys(models);
    console.log(`Found ${modelKeys.length} schemas to sync with MongoDB:`);

    for (const key of modelKeys) {
      const model = models[key];
      await model.createCollection();
      console.log(`  ✓ Created/verified collection for model: ${model.modelName} (Collection: '${model.collection.name}')`);
    }

    console.log('\nAll schemas successfully connected and collections created in MongoDB!');
    console.log('\nYou can now open MongoDB Compass and connect to:');
    console.log(`  Connection URI: ${connStr}`);
    console.log(`  Database Name: odoo`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database collections:', error);
    process.exit(1);
  }
};

initDatabase();
