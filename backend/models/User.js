const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Base User schema
const options = { discriminatorKey: "role", timestamps: true };

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "tpo", "company"],
      required: true,
    },
  },
  options
);

const User = mongoose.model("User", UserSchema);

// Student specific fields
const Student = User.discriminator(
  "student",
  new Schema({
    enrollmentNumber: { type: String, required: true },
    branch: { type: String, required: true },
    graduationYear: { type: Number },
  })
);

// Company specific fields
const Company = User.discriminator(
  "company",
  new Schema({
    hrName: { type: String, required: true },
    contactNumber: { type: String, required: true },
  })
);

// TPO (Training & Placement Officer) specific fields
const TPO = User.discriminator(
  "tpo",
  new Schema({
    instituteName: { type: String, required: true },
    contactNumber: { type: String, required: true },
  })
);

module.exports = { User, Student, Company, TPO };
