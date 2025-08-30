const authTests = [
  {
    name: "Register a Student",
    method: "POST",
    endpoint: "/api/auth/register",
    body: {
      name: "Test Student",
      email: "student@test.com",
      password: "password123",
      role: "student"
    }
  },
  {
    name: "Register a Company",
    method: "POST",
    endpoint: "/api/auth/register",
    body: {
      name: "Test Company",
      email: "company@test.com",
      password: "password123",
      role: "company"
    }
  },
  {
    name: "Login as Student",
    method: "POST",
    endpoint: "/api/auth/login",
    body: {
      email: "student@test.com",
      password: "password123"
    }
  },
  {
    name: "Login as Company",
    method: "POST",
    endpoint: "/api/auth/login",
    body: {
      email: "company@test.com",
      password: "password123"
    }
  }
];

const profileTests = [
  {
    name: "Get Student Profile",
    method: "GET",
    endpoint: "/api/profile/me",
    auth: "student"
  },
  {
    name: "Update Student Profile",
    method: "PUT",
    endpoint: "/api/profile/me",
    auth: "student",
    body: {
      personalInfo: {
        dob: "2000-01-01",
        contact: "1234567890",
        address: "123 Main St"
      },
      academicDetails: [
        {
          degree: "B.Tech",
          branch: "Computer Science",
          cgpa: 8.5,
          passingYear: 2025
        }
      ],
      skills: ["JavaScript", "React", "Node.js"],
      projects: [
        {
          title: "Placement Tracker",
          description: "A web app to track job applications",
          link: "https://github.com/example/placement-tracker"
        }
      ],
      certifications: [
        {
          name: "Web Development",
          authority: "Udemy",
          link: "https://udemy.com/certificate/123"
        }
      ]
    }
  },
  {
    name: "Get Company Profile",
    method: "GET",
    endpoint: "/api/profile/me",
    auth: "company"
  },
  {
    name: "Update Company Profile",
    method: "PUT",
    endpoint: "/api/profile/me",
    auth: "company",
    body: {
      companyName: "Updated Test Company",
      website: "https://testcompany.com",
      description: "A test company for the placement tracker app"
    }
  }
];

const resumeTests = [
  {
    name: "Create Resume",
    method: "POST",
    endpoint: "/api/resumes",
    auth: "student",
    body: {
      template: "modern",
      data: {
        personalInfo: {
          name: "Test Student",
          email: "student@test.com",
          phone: "1234567890",
          address: "123 Main St"
        },
        academicDetails: [
          {
            degree: "B.Tech",
            branch: "Computer Science",
            cgpa: 8.5,
            passingYear: 2025
          }
        ],
        skills: ["JavaScript", "React", "Node.js"],
        projects: [
          {
            title: "Placement Tracker",
            description: "A web app to track job applications",
            link: "https://github.com/example/placement-tracker"
          }
        ],
        certifications: [
          {
            name: "Web Development",
            authority: "Udemy",
            link: "https://udemy.com/certificate/123"
          }
        ],
        careerObjective: "Seeking a challenging position to utilize my skills and abilities"
      },
      version: "1.0"
    }
  },
  {
    name: "Get All Resumes",
    method: "GET",
    endpoint: "/api/resumes",
    auth: "student"
  },
  {
    name: "Get Resume by ID",
    method: "GET",
    endpoint: "/api/resumes/:resumeId",
    auth: "student",
    note: "Replace :resumeId with the actual ID from the 'Get All Resumes' response"
  },
  {
    name: "Update Resume",
    method: "PUT",
    endpoint: "/api/resumes/:resumeId",
    auth: "student",
    body: {
      template: "classic",
      data: {
        careerObjective: "Updated career objective"
      },
      version: "1.1"
    },
    note: "Replace :resumeId with the actual ID from the 'Get All Resumes' response"
  },
  {
    name: "Generate PDF",
    method: "GET",
    endpoint: "/api/resumes/:resumeId/pdf",
    auth: "student",
    note: "Replace :resumeId with the actual ID from the 'Get All Resumes' response"
  },
  {
    name: "Delete Resume",
    method: "DELETE",
    endpoint: "/api/resumes/:resumeId",
    auth: "student",
    note: "Replace :resumeId with the actual ID from the 'Get All Resumes' response"
  }
];
