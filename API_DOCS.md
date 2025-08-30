# Placement Tracker API Documentation

## Job Application and Exam Management

### Apply to a Job
Apply for a job position as a student.

- **URL**: `/api/profile/apply/:jobId`
- **Method**: `POST`
- **Auth Required**: Yes (Student role only)
- **URL Params**: 
  - `jobId`: ID of the job to apply for

#### Success Response
- **Code**: 200
- **Content Example**:
```json
{
  "_id": "65a3b2c4d1e8f9g0h1i2j3k",
  "user": {
    "_id": "65a3b2c4d1e8f9g0h1i2j3k",
    "name": "John Smith",
    "email": "john@example.com"
  },
  "personalInfo": {
    "phone": "1234567890",
    "address": "123 College St"
  },
  "academicDetails": {
    "degree": "B.Tech",
    "branch": "Computer Science",
    "semester": 6,
    "cgpa": 8.5
  },
  "appliedJobs": [
    {
      "_id": "65a3b2c4d1e8f9g0h1i2j3k",
      "job": {
        "_id": "65a3b2c4d1e8f9g0h1i2j3k",
        "title": "Software Engineer Intern",
        "company": {
          "_id": "65a3b2c4d1e8f9g0h1i2j3k",
          "companyName": "Tech Solutions Inc."
        },
        "deadline": "2023-08-15T00:00:00.000Z"
      },
      "appliedDate": "2023-07-01T12:30:00.000Z",
      "status": "Applied",
      "examScheduled": {
        "isScheduled": false
      }
    }
  ]
}
```

#### Error Responses
- **Code**: 400
  - **Content**: `{ "msg": "Invalid job ID" }` or `{ "msg": "Already applied to this job" }`
- **Code**: 403
  - **Content**: `{ "msg": "Only students can apply to jobs" }`
- **Code**: 404
  - **Content**: `{ "msg": "Student profile not found" }`
- **Code**: 500
  - **Content**: `{ "msg": "Server Error" }`

### Get Upcoming Exams
Retrieve all upcoming exams for the logged-in student.

- **URL**: `/api/profile/exams`
- **Method**: `GET`
- **Auth Required**: Yes (Student role only)

#### Success Response
- **Code**: 200
- **Content Example**:
```json
{
  "_id": "65a3b2c4d1e8f9g0h1i2j3k",
  "upcomingExams": [
    {
      "_id": "65a3b2c4d1e8f9g0h1i2j3k",
      "job": {
        "_id": "65a3b2c4d1e8f9g0h1i2j3k",
        "title": "Software Engineer",
        "description": "Entry level software engineer position",
        "company": {
          "_id": "65a3b2c4d1e8f9g0h1i2j3k",
          "companyName": "Tech Solutions Inc."
        }
      },
      "examDate": "2023-07-15T00:00:00.000Z",
      "examTime": "10:00 AM",
      "examVenue": "Main Campus, Room 301",
      "examType": "Written Test",
      "round": "First Round"
    },
    {
      "_id": "65a3b2c4d1e8f9g0h1i2j3k",
      "job": {
        "_id": "65a3b2c4d1e8f9g0h1i2j3k",
        "title": "Web Developer",
        "description": "Frontend development position",
        "company": {
          "_id": "65a3b2c4d1e8f9g0h1i2j3k",
          "companyName": "Web Solutions Ltd."
        }
      },
      "examDate": "2023-07-20T00:00:00.000Z",
      "examTime": "2:00 PM",
      "examVenue": "Online - Zoom Link will be shared",
      "examType": "Coding Test",
      "round": "First Round"
    }
  ]
}
```

#### Error Responses
- **Code**: 403
  - **Content**: `{ "msg": "Only students can view upcoming exams" }`
- **Code**: 404
  - **Content**: `{ "msg": "Student profile not found" }`
- **Code**: 500
  - **Content**: `{ "msg": "Server Error" }`

### Update Job Application Status
Update the status of a job application, including adding/updating exam schedule.

- **URL**: `/api/profile/application/:applicationId`
- **Method**: `PUT`
- **Auth Required**: Yes (Student or TPO role)
- **URL Params**: 
  - `applicationId`: ID of the application to update
- **Data Params**:
```json
{
  "status": "Shortlisted", // Optional
  "examDetails": { // Optional
    "examDate": "2023-07-15",
    "examTime": "10:00 AM",
    "examVenue": "Main Campus, Room 301",
    "examType": "Written Test",
    "round": "First Round"
  },
  "studentId": "65a3b2c4d1e8f9g0h1i2j3k" // Required only if TPO is making the update
}
```

#### Success Response
- **Code**: 200
- **Content Example**: Returns the updated student profile with populated job applications.

#### Error Responses
- **Code**: 400
  - **Content**: `{ "msg": "Student ID is required for TPO updates" }`
- **Code**: 403
  - **Content**: `{ "msg": "Unauthorized to update application status" }`
- **Code**: 404
  - **Content**: `{ "msg": "Student profile not found" }` or `{ "msg": "Application not found" }`
- **Code**: 500
  - **Content**: `{ "msg": "Server Error" }`

## Testing Examples with cURL

### Apply to a Job
```bash
curl -X POST \
  http://localhost:5000/api/profile/apply/65a3b2c4d1e8f9g0h1i2j3k \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### Get Upcoming Exams
```bash
curl -X GET \
  http://localhost:5000/api/profile/exams \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Update Job Application Status
```bash
curl -X PUT \
  http://localhost:5000/api/profile/application/65a3b2c4d1e8f9g0h1i2j3k \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Shortlisted",
    "examDetails": {
      "examDate": "2023-07-15",
      "examTime": "10:00 AM",
      "examVenue": "Main Campus, Room 301",
      "examType": "Written Test",
      "round": "First Round"
    }
  }'
```

## Testing with Postman

1. Import the API endpoints into Postman
2. Set up an environment variable for your JWT token
3. Make requests to each endpoint with the appropriate parameters
4. For the authorization, use the Bearer Token type with your JWT token
5. Check the response status codes and bodies to verify functionality
