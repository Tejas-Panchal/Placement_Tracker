const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Student, Company, TPO } = require("../models/User");
const Otp = require("../models/Otp");
const StudentProfile = require("../models/StudentProfile");
const CompanyProfile = require("../models/CompanyProfile");

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    // A. Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "An account with this email already exists." });
    }

    // B. Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // C. Save the OTP to the database, linked to the email
    await Otp.create({ email, otp });

    // D. Configure the email transporter using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // E. Send the email with the OTP
    await transporter.sendMail({
      from: `"Placement Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your One-Time Password (OTP) for Placement Tracker registration is: ${otp}\n\nThis code will expire in 5 minutes.`,
    });

    res
      .status(200)
      .json({ msg: "OTP has been sent successfully to your email." });
  } catch (err) {
    console.error("Error in sendOtp:", err.message);
    res.status(500).send("Server Error");
  }
};

// User Registration
exports.registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    enrollmentNumber,
    branch,
    graduationYear,
    hrName,
    contactNumber,
    instituteName,
    otp,
  } = req.body;

  try {
    const storedOtp = await Otp.findOne({ email });
    if (!storedOtp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    if (role === "student") {
      user = new Student({
        name,
        email,
        password,
        role,
        enrollmentNumber,
        branch,
        graduationYear,
      });
    } else if (role === "company") {
      user = new Company({
        name,
        email,
        password,
        role,
        hrName,
        contactNumber,
      });
    } else if (role === "tpo") {
      user = new TPO({
        name,
        email,
        password,
        role,
        instituteName,
        contactNumber,
      });
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
    await Otp.deleteOne({ email, otp });
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
