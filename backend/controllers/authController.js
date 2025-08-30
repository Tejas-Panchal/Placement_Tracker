const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Student, Company, TPO } = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const CompanyProfile = require("../models/CompanyProfile");

// User Registration
exports.registerUser = async (req, res) => {
  const { name, email, password, role, enrollmentNumber, branch, graduationYear, hrName, contactNumber, instituteName } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    if (role === "student") {
        user = new Student({ name, email, password, role, enrollmentNumber, branch, graduationYear });
    } else if (role === "company") {
        user = new Company({ name, email, password, role, hrName, contactNumber });
    } else if (role === "tpo") {
        user = new TPO({ name, email, password, role, instituteName, contactNumber });
    } else {
        return res.status(400).json({ msg: "Invalid user role" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    if (role === "student") {
      const studentProfile = new StudentProfile({ user: user.id });
      await studentProfile.save();
    } else if (role === "company") {
      const companyProfile = new CompanyProfile({
        user: user.id,
        companyName: "Default Company Name",
      });
      await companyProfile.save();
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3000000" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// User Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3000000" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
