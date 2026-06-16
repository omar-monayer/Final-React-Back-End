# Nexsus Backend

This is the backend API server for the Nexsus fullstack web application.

The backend is built with Node.js, Express.js, and PostgreSQL. It handles authentication, admin management, company filters, company unique filters, locations, industries, sizes, job titles, user dashboard data, user companies, user leads, and weather data.

## Repository

```bash id="repo-origin"
https://github.com/omar-monayer/Final-React-Back-End.git
```

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* pg
* dotenv
* cors

## Features

* User login
* Role-based admin protection
* PostgreSQL database connection
* Admin CRUD operations
* User dashboard API
* User companies API
* User leads API
* Weather API for Amman
* Soft delete support for admin data

## Getting Started

Clone the repository:

```bash id="clone-repo"
git clone https://github.com/omar-monayer/Final-React-Back-End.git
```

Go inside the project folder:

```bash id="cd-repo"
cd Final-React-Back-End
```

Install dependencies:

```bash id="install-deps"
npm install
```

Create a `.env` file in the root folder:

```bash id="env-file"
DATABASE_URL=your_postgresql_connection_string
PORT=3000
```

Start the server:

```bash id="start-server"
npm start
```

The backend starts from:

```bash id="entry-file"
server.js
```

## Environment Variables

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT`         | Server port                  |

Example `.env` file:

```bash id="env-example"
DATABASE_URL=postgresql://username:password@host:port/database_name
PORT=3000
```

Do not upload the `.env` file to GitHub.

## API Origin

Use your deployed backend origin instead of localhost.

```bash id="api-origin"
API_ORIGIN=https://your-deployed-backend-origin.com
```

Example API request:

```bash id="api-example"
GET ${API_ORIGIN}/api/user/dashboard-companies?email=user@example.com
```

## Project Structure

```bash id="project-structure"
Final-React-Back-End/
├── config/
│   └── db.js
├── middleware/
│   └── adminAuth.js
├── routes/
│   ├── authRoutes.js
│   ├── companyFiltersRoutes.js
│   ├── companyUniqueFiltersRoutes.js
│   ├── industryRoutes.js
│   ├── jobTitleRoutes.js
│   ├── locationRoutes.js
│   ├── sizeRoutes.js
│   ├── userHomeRoutes.js
│   └── weatherRoutes.js
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Authentication

The backend uses the `userslogin` table for login.

### Login

```bash id="login-endpoint"
POST ${API_ORIGIN}/api/auth/login
```

Request body:

```json id="login-body"
{
  "email": "user@example.com",
  "password": "123456"
}
```

Successful response:

```json id="login-response"
{
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

## Admin Authorization

Admin routes require the `x-role` header.

```json id="admin-header"
{
  "x-role": "admin"
}
```

If the header is missing or the role is not `admin`, the server returns:

```json id="admin-error"
{
  "message": "Admin access only"
}
```

## API Endpoints

### Main Routes

| Method | Endpoint           | Description                        |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/`                | Check if the API server is running |
| GET    | `/api/admin/check` | Check admin access                 |

Example:

```bash id="main-route-example"
GET ${API_ORIGIN}/
```

Example:

```bash id="admin-check-example"
GET ${API_ORIGIN}/api/admin/check
```

Required header:

```json id="admin-check-header"
{
  "x-role": "admin"
}
```

---

### Auth Routes

Base route:

```bash id="auth-base"
/api/auth
```

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | `/login` | Login user  |

Example:

```bash id="auth-login-example"
POST ${API_ORIGIN}/api/auth/login
```

Request body:

```json id="auth-login-body"
{
  "email": "user@example.com",
  "password": "123456"
}
```

---

### Company Filters Routes

Base route:

```bash id="company-filters-base"
/api/company-filters
```

These routes are admin protected.

Required header:

```json id="company-filters-header"
{
  "x-role": "admin"
}
```

| Method | Endpoint      | Description                     |
| ------ | ------------- | ------------------------------- |
| GET    | `/`           | Get all company filters         |
| GET    | `/companies`  | Get companies for the add form  |
| GET    | `/job-titles` | Get job titles for the add form |
| POST   | `/`           | Add a new company filter        |
| PUT    | `/:id`        | Update company filter by ID     |
| DELETE | `/:id`        | Delete company filter by ID     |

Examples:

```bash id="get-company-filters"
GET ${API_ORIGIN}/api/company-filters
```

```bash id="get-company-filter-companies"
GET ${API_ORIGIN}/api/company-filters/companies
```

```bash id="get-company-filter-job-titles"
GET ${API_ORIGIN}/api/company-filters/job-titles
```

```bash id="post-company-filter"
POST ${API_ORIGIN}/api/company-filters
```

Request body:

```json id="company-filter-body"
{
  "companyId": 1,
  "companyProfile": "Company profile text",
  "senderArabicName": "اسم المرسل",
  "senderEnglishName": "Sender Name",
  "numberOfLeads": 30,
  "smtpHost": "smtp.example.com",
  "smtpPort": 587,
  "smtpSender": "sender@example.com",
  "smtpAlias": "Sender Alias",
  "smtpAppPassword": "app-password",
  "emailSignature": "Best regards",
  "proposalInfo": "Proposal information",
  "calendly": "https://calendly.com/example",
  "jobTitleIds": [1, 2, 3]
}
```

Update example:

```bash id="put-company-filter"
PUT ${API_ORIGIN}/api/company-filters/1
```

Request body:

```json id="company-filter-update-body"
{
  "smtpHost": "smtp.example.com",
  "smtpPort": 587,
  "sender": "sender@example.com",
  "alias": "Sender Alias",
  "password": "new-password",
  "emailSignature": "Updated signature",
  "proposalInfo": "Updated proposal info",
  "leadsPerMonth": 60,
  "calendly": "https://calendly.com/example",
  "active": true
}
```

Delete example:

```bash id="delete-company-filter"
DELETE ${API_ORIGIN}/api/company-filters/1
```

---

### Company Unique Filters Routes

Base route:

```bash id="company-unique-filters-base"
/api/company-unique-filters
```

These routes are admin protected.

Required header:

```json id="company-unique-filters-header"
{
  "x-role": "admin"
}
```

| Method | Endpoint        | Description                                   |
| ------ | --------------- | --------------------------------------------- |
| GET    | `/`             | Get all company unique filters                |
| GET    | `/locations`    | Get locations for the add form                |
| GET    | `/industries`   | Get industries for the add form               |
| GET    | `/sizes`        | Get sizes for the add form                    |
| GET    | `/form-options` | Get locations, industries, and sizes together |
| POST   | `/`             | Add a new company unique filter               |
| PUT    | `/:id`          | Update company unique filter by ID            |
| DELETE | `/:id`          | Delete company unique filter by ID            |

Examples:

```bash id="get-company-unique-filters"
GET ${API_ORIGIN}/api/company-unique-filters
```

```bash id="get-company-unique-locations"
GET ${API_ORIGIN}/api/company-unique-filters/locations
```

```bash id="get-company-unique-industries"
GET ${API_ORIGIN}/api/company-unique-filters/industries
```

```bash id="get-company-unique-sizes"
GET ${API_ORIGIN}/api/company-unique-filters/sizes
```

```bash id="get-company-unique-form-options"
GET ${API_ORIGIN}/api/company-unique-filters/form-options
```

Add example:

```bash id="post-company-unique-filter"
POST ${API_ORIGIN}/api/company-unique-filters
```

Request body:

```json id="company-unique-filter-body"
{
  "locationId": 1,
  "industryId": 2,
  "sizeId": 3,
  "pages": 10,
  "extracted": 50,
  "leads": 20,
  "active": true,
  "done": false
}
```

Update example:

```bash id="put-company-unique-filter"
PUT ${API_ORIGIN}/api/company-unique-filters/1
```

Request body:

```json id="company-unique-filter-update-body"
{
  "locationId": 1,
  "industryId": 2,
  "sizeId": 3,
  "pages": 12,
  "extracted": 60,
  "leads": 25,
  "active": true,
  "done": true
}
```

Delete example:

```bash id="delete-company-unique-filter"
DELETE ${API_ORIGIN}/api/company-unique-filters/1
```

---

### Location Routes

Base route:

```bash id="locations-base"
/api/locations
```

These routes are admin protected.

Required header:

```json id="locations-header"
{
  "x-role": "admin"
}
```

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | `/`      | Get all locations     |
| POST   | `/`      | Add a new location    |
| PUT    | `/:id`   | Update location by ID |
| DELETE | `/:id`   | Delete location by ID |

Examples:

```bash id="get-locations"
GET ${API_ORIGIN}/api/locations
```

```bash id="post-location"
POST ${API_ORIGIN}/api/locations
```

Request body:

```json id="location-body"
{
  "location": "Jordan",
  "linkedinId": "jo"
}
```

Update example:

```bash id="put-location"
PUT ${API_ORIGIN}/api/locations/1
```

Request body:

```json id="location-update-body"
{
  "location": "Amman",
  "linkedinId": "amman"
}
```

Delete example:

```bash id="delete-location"
DELETE ${API_ORIGIN}/api/locations/1
```

---

### Industry Routes

Base route:

```bash id="industries-base"
/api/industries
```

These routes are admin protected.

Required header:

```json id="industries-header"
{
  "x-role": "admin"
}
```

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | `/`      | Get all industries    |
| POST   | `/`      | Add a new industry    |
| PUT    | `/:id`   | Update industry by ID |
| DELETE | `/:id`   | Delete industry by ID |

Examples:

```bash id="get-industries"
GET ${API_ORIGIN}/api/industries
```

```bash id="post-industry"
POST ${API_ORIGIN}/api/industries
```

Request body:

```json id="industry-body"
{
  "industry": "Information Technology",
  "linkedinId": "it"
}
```

Update example:

```bash id="put-industry"
PUT ${API_ORIGIN}/api/industries/1
```

Request body:

```json id="industry-update-body"
{
  "industry": "Software Development",
  "linkedinId": "software"
}
```

Delete example:

```bash id="delete-industry"
DELETE ${API_ORIGIN}/api/industries/1
```

---

### Size Routes

Base route:

```bash id="sizes-base"
/api/sizes
```

These routes are admin protected.

Required header:

```json id="sizes-header"
{
  "x-role": "admin"
}
```

| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| GET    | `/`      | Get all company sizes     |
| POST   | `/`      | Add a new company size    |
| PUT    | `/:id`   | Update company size by ID |
| DELETE | `/:id`   | Delete company size by ID |

Examples:

```bash id="get-sizes"
GET ${API_ORIGIN}/api/sizes
```

```bash id="post-size"
POST ${API_ORIGIN}/api/sizes
```

Request body:

```json id="size-body"
{
  "size": "11-50 employees"
}
```

Update example:

```bash id="put-size"
PUT ${API_ORIGIN}/api/sizes/1
```

Request body:

```json id="size-update-body"
{
  "size": "51-200 employees"
}
```

Delete example:

```bash id="delete-size"
DELETE ${API_ORIGIN}/api/sizes/1
```

---

### Job Title Routes

Base route:

```bash id="job-titles-base"
/api/job-titles
```

These routes are admin protected.

Required header:

```json id="job-titles-header"
{
  "x-role": "admin"
}
```

| Method | Endpoint | Description            |
| ------ | -------- | ---------------------- |
| GET    | `/`      | Get all job titles     |
| POST   | `/`      | Add a new job title    |
| PUT    | `/:id`   | Update job title by ID |
| DELETE | `/:id`   | Delete job title by ID |

Examples:

```bash id="get-job-titles"
GET ${API_ORIGIN}/api/job-titles
```

```bash id="post-job-title"
POST ${API_ORIGIN}/api/job-titles
```

Request body:

```json id="job-title-body"
{
  "jobTitle": "Marketing Manager"
}
```

Update example:

```bash id="put-job-title"
PUT ${API_ORIGIN}/api/job-titles/1
```

Request body:

```json id="job-title-update-body"
{
  "jobTitle": "Sales Manager"
}
```

Delete example:

```bash id="delete-job-title"
DELETE ${API_ORIGIN}/api/job-titles/1
```

---

### User Routes

Base route:

```bash id="user-base"
/api/user
```

| Method | Endpoint               | Description                                    |
| ------ | ---------------------- | ---------------------------------------------- |
| GET    | `/dashboard-companies` | Get dashboard companies for the logged-in user |
| GET    | `/companies`           | Get companies connected to the logged-in user  |
| GET    | `/leads`               | Get leads connected to the logged-in user      |

#### Get Dashboard Companies

```bash id="get-dashboard-companies"
GET ${API_ORIGIN}/api/user/dashboard-companies?email=user@example.com
```

Required query parameter:

| Parameter | Description          |
| --------- | -------------------- |
| `email`   | Logged-in user email |

#### Get Companies

```bash id="get-user-companies"
GET ${API_ORIGIN}/api/user/companies?email=user@example.com&coflId=1
```

Query parameters:

| Parameter | Required | Description          |
| --------- | -------- | -------------------- |
| `email`   | Yes      | Logged-in user email |
| `coflId`  | No       | Company filter ID    |

#### Get Leads

```bash id="get-user-leads"
GET ${API_ORIGIN}/api/user/leads?email=user@example.com&comscId=1
```

Query parameters:

| Parameter | Required | Description          |
| --------- | -------- | -------------------- |
| `email`   | Yes      | Logged-in user email |
| `comscId` | No       | Company scraping ID  |

---

### Weather Routes

Base route:

```bash id="weather-base"
/api/weather
```

| Method | Endpoint | Description                |
| ------ | -------- | -------------------------- |
| GET    | `/amman` | Get weather data for Amman |

Example:

```bash id="get-weather-amman"
GET ${API_ORIGIN}/api/weather/amman
```

Example response:

```json id="weather-response"
{
  "city": "Amman",
  "temperature": 25,
  "windSpeed": 12,
  "description": "Clear sky"
}
```

## Full API List

```bash id="full-api-list"
GET     /
GET     /api/admin/check

POST    /api/auth/login

GET     /api/company-filters
GET     /api/company-filters/companies
GET     /api/company-filters/job-titles
POST    /api/company-filters
PUT     /api/company-filters/:id
DELETE  /api/company-filters/:id

GET     /api/company-unique-filters
GET     /api/company-unique-filters/locations
GET     /api/company-unique-filters/industries
GET     /api/company-unique-filters/sizes
GET     /api/company-unique-filters/form-options
POST    /api/company-unique-filters
PUT     /api/company-unique-filters/:id
DELETE  /api/company-unique-filters/:id

GET     /api/locations
POST    /api/locations
PUT     /api/locations/:id
DELETE  /api/locations/:id

GET     /api/industries
POST    /api/industries
PUT     /api/industries/:id
DELETE  /api/industries/:id

GET     /api/sizes
POST    /api/sizes
PUT     /api/sizes/:id
DELETE  /api/sizes/:id

GET     /api/job-titles
POST    /api/job-titles
PUT     /api/job-titles/:id
DELETE  /api/job-titles/:id

GET     /api/user/dashboard-companies
GET     /api/user/companies
GET     /api/user/leads

GET     /api/weather/amman
```

## Database Connection

The database connection is configured in:

```bash id="db-file"
config/db.js
```

The backend uses PostgreSQL through the `pg` package and reads the connection string from:

```bash id="database-url"
process.env.DATABASE_URL
```

## Notes

* Make sure the PostgreSQL database exists before starting the backend.
* Make sure the `.env` file contains the correct `DATABASE_URL`.
* Use the deployed backend origin for frontend API requests.
* Do not upload the `.env` file to GitHub.
* Admin routes require the `x-role: admin` header.
* Delete requests use soft delete by setting `deleted = 1`.
* This backend is connected to the Nexsus React frontend application.

## License

This project uses the MIT License.
