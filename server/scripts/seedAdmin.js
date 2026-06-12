import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sanji-gaming';

  console.log('🔌 Connecting to MongoDB...');
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    console.log('🧹 Clearing existing Admin collection...');
    await Admin.deleteMany({});
    console.log('✅ Cleared Admin collection.');

    const email = 'admin123@gmail.com';
    const rawPassword = 'admin123';
    const whatsappNumber = '94700000000';

    console.log('🔐 Hashing default password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    console.log('✍️ Creating new Admin document...');
    const newAdmin = await Admin.create({
      email,
      password: hashedPassword,
      whatsappNumber,
    });

    console.log('────────────────────────────────────────');
    console.log('✅ Admin credentials seeded successfully!');
    console.log(`Email          : ${newAdmin.email}`);
    console.log(`WhatsApp Number: ${newAdmin.whatsappNumber}`);
    console.log('────────────────────────────────────────');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
};

seedAdmin();
