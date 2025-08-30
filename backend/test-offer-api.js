// API Test Script for Offer and Job APIs
// Save this as test-offer-api.js

const axios = require('axios');

// Set your JWT token here (you should get this by logging in)
const token = 'YOUR_JWT_TOKEN'; // Replace with your actual token
const baseUrl = 'http://localhost:5000/api';

// Headers with authentication token
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// 1. Test creating a job
async function testCreateJob() {
  try {
    const jobData = {
      title: "Test Software Engineer",
      description: "This is a test job posting",
      location: "Test Location",
      jobType: "Full-time",
      positions: 2,
      eligibilityCriteria: {
        branches: ["Computer Science"],
        minCGPA: 7.0,
        graduationYear: 2025
      },
      package: {
        totalCTC: 800000
      },
      applicationDeadline: "2025-12-31"
    };
    
    const response = await axios.post(`${baseUrl}/company/jobs`, jobData, { headers });
    console.log('Job created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error.response ? error.response.data : error.message);
  }
}

// 2. Test getting all jobs
async function testGetJobs() {
  try {
    const response = await axios.get(`${baseUrl}/company/jobs`, { headers });
    console.log('All jobs:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting jobs:', error.response ? error.response.data : error.message);
  }
}

// 3. Test creating an offer
async function testCreateOffer(jobId, studentId) {
  try {
    const offerData = {
      job: jobId,
      student: studentId,
      package: 850000,
      offerDetails: "This is a test offer",
      joiningDate: "2026-01-15"
    };
    
    const response = await axios.post(`${baseUrl}/offers`, offerData, { headers });
    console.log('Offer created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating offer:', error.response ? error.response.data : error.message);
  }
}

// 4. Test getting company offers
async function testGetCompanyOffers() {
  try {
    const response = await axios.get(`${baseUrl}/offers/company`, { headers });
    console.log('Company offers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting offers:', error.response ? error.response.data : error.message);
  }
}

// Run the tests (comment out as needed)
async function runTests() {
  // First create a job
  const job = await testCreateJob();
  
  // Get all jobs
  const jobs = await testGetJobs();
  
  // If you have a student ID, you can create an offer
  // const offer = await testCreateOffer(job._id, "STUDENT_ID_HERE");
  
  // Get all company offers
  const offers = await testGetCompanyOffers();
}

runTests();
