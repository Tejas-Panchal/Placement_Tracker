const Offer = require("../models/Offer");
const Job = require("../models/Job");
const StudentProfile = require("../models/StudentProfile");
const CompanyProfile = require("../models/CompanyProfile");

// Create a new offer (company only)
exports.createOffer = async (req, res) => {
  try {
    // Handle both jobId and job field names for flexibility
    const {
      jobId,
      job: jobField,
      studentId,
      student,
      package,
      tier,
      offerDetails,
      joiningDate,
    } = req.body;

    // Use either jobId or job field
    const jobIdentifier = jobId || jobField;
    const studentIdentifier = studentId || student;

    if (!jobIdentifier) {
      return res.status(400).json({ msg: "Job ID is required" });
    }

    if (!studentIdentifier) {
      return res.status(400).json({ msg: "Student ID is required" });
    }

    const job = await Job.findById(jobIdentifier);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ msg: "Company profile not found" });
    }

    if (job.company.toString() !== companyProfile._id.toString()) {
      return res
        .status(401)
        .json({ msg: "Not authorized to create offers for this job" });
    }

    const studentProfile = await StudentProfile.findById(studentId);
    if (!studentProfile) {
      return res.status(404).json({ msg: "Student not found" });
    }

    const existingOffer = await Offer.findOne({
      job: jobId,
      student: studentId,
    });
    if (existingOffer) {
      return res
        .status(400)
        .json({ msg: "An offer already exists for this student and job" });
    }

    // Create new offer
    const newOffer = new Offer({
      job: jobIdentifier,
      student: studentIdentifier,
      company: companyProfile._id,
      package,
      tier: tier || undefined,
      offerDetails,
      joiningDate,
    });

    const offer = await newOffer.save();

    // Add offer to student's offers list
    if (!studentProfile.offers) {
      studentProfile.offers = [];
    }
    studentProfile.offers.push(offer._id);
    await studentProfile.save();

    // Return the offer with populated job and company details
    const populatedOffer = await Offer.findById(offer._id)
      .populate("job", "title description location")
      .populate("company", "companyName")
      .populate("student", "user");

    res.json(populatedOffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get all offers made by a company (company only)
exports.getCompanyOffers = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ msg: "Company profile not found" });
    }

    const offers = await Offer.find({ company: companyProfile._id })
      .populate({
        path: "student",
        select: "user personalInfo academicDetails",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "job",
        select: "title description location jobType package",
      });

    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get all offers for a student (student or TPO only)
exports.getStudentOffers = async (req, res) => {
  try {
    let studentId;

    if (req.user.role === "student") {
      const studentProfile = await StudentProfile.findOne({
        user: req.user.id,
      });
      if (!studentProfile) {
        return res.status(404).json({ msg: "Student profile not found" });
      }
      studentId = studentProfile._id;
    } else if (req.user.role === "tpo") {
      studentId = req.params.studentId;

      // Verify the student exists
      const studentExists = await StudentProfile.findById(studentId);
      if (!studentExists) {
        return res.status(404).json({ msg: "Student profile not found" });
      }
    } else {
      return res
        .status(403)
        .json({ msg: "Not authorized to view these offers" });
    }

    const offers = await Offer.find({ student: studentId })
      .populate({
        path: "job",
        select:
          "title description location jobType package applicationDeadline",
      })
      .populate({
        path: "company",
        select: "companyName website industry",
      });

    if (!offers || offers.length === 0) {
      return res.json({ msg: "No offers found", offers: [] });
    }

    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update offer status (student only)
exports.updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ msg: "Status must be either Accepted or Rejected" });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ msg: "Student profile not found" });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ msg: "Offer not found" });
    }

    if (offer.student.toString() !== studentProfile._id.toString()) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this offer" });
    }

    if (offer.status !== "Pending") {
      return res
        .status(400)
        .json({ msg: "Cannot update an offer that is not pending" });
    }

    offer.status = status;
    await offer.save();

    if (status === "Accepted") {
      studentProfile.placementStatus = "Placed";
      await studentProfile.save();
    }

    res.json(offer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Offer not found" });
    }
    res.status(500).send("Server Error");
  }
};

// Get offer details by ID (all parties involved)
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("job")
      .populate({
        path: "company",
        select: "companyName website",
      })
      .populate({
        path: "student",
        select: "user personalInfo",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    if (!offer) {
      return res.status(404).json({ msg: "Offer not found" });
    }

    let authorized = false;

    if (req.user.role === "company") {
      const companyProfile = await CompanyProfile.findOne({
        user: req.user.id,
      });
      if (
        companyProfile &&
        offer.company._id.toString() === companyProfile._id.toString()
      ) {
        authorized = true;
      }
    } else if (req.user.role === "student") {
      const studentProfile = await StudentProfile.findOne({
        user: req.user.id,
      });
      if (
        studentProfile &&
        offer.student._id.toString() === studentProfile._id.toString()
      ) {
        authorized = true;
      }
    } else if (req.user.role === "tpo") {
      authorized = true;
    }

    if (!authorized) {
      return res.status(401).json({ msg: "Not authorized to view this offer" });
    }

    res.json(offer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Offer not found" });
    }
    res.status(500).send("Server Error");
  }
};
