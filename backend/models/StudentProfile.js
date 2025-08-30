const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personalInfo: {
      dob: Date,
      contact: String,
      address: String,
    },
    academicDetails: [
      {
        degree: String,
        branch: String,
        cgpa: Number,
        passingYear: Number,
      },
    ],
    skills: [String],
    projects: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    certifications: [
      {
        name: String,
        authority: String,
        link: String,
      },
    ],
    placementStatus: {
      type: String,
      enum: ["Not Placed", "Placed"],
      default: "Not Placed",
    },
    offers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offer",
      },
    ],
    appliedJobs: [
      {
        job: {
          type: Schema.Types.ObjectId,
          ref: "Job",
        },
        appliedDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: [
            "Applied",
            "Shortlisted",
            "Rejected",
            "In Progress",
            "Selected",
          ],
          default: "Applied",
        },
        examScheduled: {
          isScheduled: {
            type: Boolean,
            default: false,
          },
          examDate: Date,
          examTime: String,
          examVenue: String,
          examType: {
            type: String,
            enum: ["Online", "Offline", "Interview"],
            default: "Online",
          },
          round: {
            type: String,
            default: "Initial",
          },
        },
      },
    ],
    upcomingExams: {
      type: [
        {
          job: {
            type: Schema.Types.ObjectId,
            ref: "Job",
          },
          company: {
            type: Schema.Types.ObjectId,
            ref: "CompanyProfile",
          },
          examDate: Date,
          examTime: String,
          examVenue: String,
          examType: {
            type: String,
            enum: ["Online", "Offline", "Interview"],
          },
          round: String,
        },
      ],
      default: [],
    },
    upgradesUsed: {
      type: Number,
      default: 0,
      max: 2,
    },
  },
  { timestamps: true }
);

// Middleware to update upcomingExams whenever appliedJobs changes
StudentProfileSchema.pre("save", function (next) {
  if (this.isModified("appliedJobs")) {
    // Clear existing upcoming exams
    this.upcomingExams = [];

    // Get current date
    const now = new Date();

    // Loop through all applied jobs
    this.appliedJobs.forEach((application) => {
      // If there's an exam scheduled in the future
      if (application.examScheduled && application.examScheduled.isScheduled) {
        const examDate = new Date(application.examScheduled.examDate);

        // Only add to upcoming exams if the exam is in the future
        if (examDate > now) {
          this.upcomingExams.push({
            job: application.job,
            // We'll populate the company in the controller
            examDate: application.examScheduled.examDate,
            examTime: application.examScheduled.examTime,
            examVenue: application.examScheduled.examVenue,
            examType: application.examScheduled.examType,
            round: application.examScheduled.round,
          });
        }
      }
    });

    // Sort upcoming exams by date (closest first)
    this.upcomingExams.sort(
      (a, b) => new Date(a.examDate) - new Date(b.examDate)
    );
  }

  next();
});

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
