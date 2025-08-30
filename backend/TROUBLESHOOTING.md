# Job and Offer API Troubleshooting Guide

## Common Issues and Solutions

### 1. Job Not Found in Offer Response

**Problem**: When creating or retrieving offers, job details are missing or incomplete.

**Solutions**:

1. **Check Job Population**: Make sure you're properly populating the job field in your offer queries:

```javascript
// Correct way to populate job details
const offer = await Offer.findById(offerId)
  .populate({
    path: 'job',
    select: 'title description location jobType package' // Include all fields you need
  });
```

2. **Verify Job ID**: Ensure the job ID you're using exists in the database:

```javascript
// Verify job exists before creating offer
const job = await Job.findById(jobId);
if (!job) {
  return res.status(404).json({ msg: 'Job not found' });
}
```

3. **API Call Debugging**:
   - Add console.log statements before and after database queries
   - Check for typos in field names (e.g., using `jobId` vs `job` in request body)
   - Verify that the job ID is valid MongoDB ObjectId

### 2. Testing the API

Use the following curl commands to test your API:

```bash
# 1. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "company@example.com", "password": "password123"}'

# 2. Create a job
curl -X POST http://localhost:5000/api/company/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "description": "Test description",
    "location": "Test location",
    "jobType": "Full-time",
    "positions": 2,
    "package": {
      "totalCTC": 900000
    },
    "applicationDeadline": "2025-12-31"
  }'

# 3. Get all company jobs
curl -X GET http://localhost:5000/api/company/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Create an offer (replace JOB_ID and STUDENT_ID with actual IDs)
curl -X POST http://localhost:5000/api/offers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "job": "JOB_ID_HERE",
    "student": "STUDENT_ID_HERE",
    "package": 900000,
    "offerDetails": "Test offer details"
  }'
  
# 5. Get company offers
curl -X GET http://localhost:5000/api/offers/company \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Check Database Connection

If you're still having issues, check your MongoDB connection:

```javascript
// Add this code to your controller for debugging
const mongoose = require('mongoose');
console.log('MongoDB Connection State:', mongoose.connection.readyState);
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
```

### 4. Verify Offer Model

Check that your Offer model has the correct references:

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job', // Make sure this matches the model name exactly
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  // Other fields...
});

module.exports = mongoose.model('Offer', OfferSchema);
```

### 5. Check Server.js Configuration

Ensure all routes are properly registered in your server.js:

```javascript
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
```

### 6. Restart Server

Sometimes, simply restarting your Node.js server resolves the issue:

```bash
# Restart your server
npm run dev
```

## Still Having Issues?

If you're still experiencing problems, try these additional debugging steps:

1. **Check route order** in server.js (more specific routes should come before general ones)
2. **Verify middleware execution** by adding console.logs in your middleware functions
3. **Check for MongoDB indexes** that might be causing query performance issues
4. **Validate request data** before using it in database operations
