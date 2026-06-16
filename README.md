# Nexsus Backend (Express + PostgreSQL)

This is the backend API server for the Nexsus fullstack web application.

It provides APIs for authentication, admin management, company filters, company unique filters, locations, industries, sizes, job titles, weather data, dashboard companies, companies, and leads.

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* pg
* dotenv
* cors

## Getting Started

Clone the repository from the origin:

```bash
git clone https://github.com/omar-monayer/Final-React-Back-End.git
```

Go inside the project folder:

```bash
cd Final-React-Back-End
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root folder:

```bash
DATABASE_URL=your_postgresql_connection_string
PORT=3000
```

Start the server:

```bash
npm start
```

The API server starts from:

```bash
server.js
```

The project origin is:

```bash
https://github.com/omar-monayer/Final-React-Back-End.git
```

## Project Structure

```bash
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

## Main Features

### Authentication

The backend includes login functionality using the `userslogin` table.

### Admin Features

Admins can manage:

* Company filters
* Company unique filters
* Locations
* Industries
* Sizes
* Job titles

### User Features

Users can view:

* Dashboard companies
* Companies connected to their account
* Leads connected to their companies
* Lead email information

### Database

The backend connects to PostgreSQL using the `DATABASE_URL` value from the `.env` file.

Database connection file:

```bash
config/db.js
```

## API Endpoints

### Auth Routes

Base route:

```bash
/api/auth
```

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | `/login` | Login user  |

#### POST `/api/auth/login`

Logs in an existing user.

Example request body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Example response:

```json
{
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

### Company Filters Routes

Base route:

```bash
/api/company-filters
```

| Method | Endpoint      | Description                      |
| ------ | ------------- | -------------------------------- |
| GET    | `/`           | Get all company filters          |
| GET    | `/companies`  | Get companies for form options   |
| GET    | `/job-titles` | Get job titles for form options  |
| POST   | `/`           | Add a new company filter         |
| PUT    | `/:id`        | Update company filter by ID      |
| DELETE | `/:id`        | Soft delete company filter by ID |

#### POST `/api/company-filters`

Example request body:

```json
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

#### PUT `/api/company-filters/:id`

Example request body:

```json
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

---

### Company Unique Filters Routes

Base route:

```bash
/api/company-unique-filters
```

| Method | Endpoint        | Description                                   |
| ------ | --------------- | --------------------------------------------- |
| GET    | `/`             | Get all company unique filters                |
| GET    | `/locations`    | Get locations                                 |
| GET    | `/industries`   | Get industries                                |
| GET    | `/sizes`        | Get sizes                                     |
| GET    | `/form-options` | Get locations, industries, and sizes together |
| POST   | `/`             | Add a new company unique filter               |
| PUT    | `/:id`          | Update company unique filter by ID            |
| DELETE | `/:id`          | Soft delete company unique filter by ID       |

#### POST `/api/company-unique-filters`

Example request body:

```json
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

---

### User Home Routes

Base route:

```bash
/api/user
```

| Method | Endpoint                                      | Description                                |
| ------ | --------------------------------------------- | ------------------------------------------ |
| GET    | `/dashboard-companies?email=user@example.com` | Get dashboard companies for logged-in user |
| GET    | `/companies?email=user@example.com&coflId=1`  | Get companies for logged-in user           |
| GET    | `/leads?email=user@example.com&comscId=1`     | Get leads for logged-in user               |

#### GET `/api/user/dashboard-companies`

Required query parameter:

```bash
email
```

Example:

```bash
/api/user/dashboard-companies?email=user@example.com
```

#### GET `/api/user/companies`

Required query parameter:

```bash
email
```

Optional query parameter:

```bash
coflId
```

Example:

```bash
/api/user/companies?email=user@example.com&coflId=1
```

#### GET `/api/user/leads`

Required query parameter:

```bash
email
```

Optional query parameter:

```bash
comscId
```

Example:

```bash
/api/user/leads?email=user@example.com&comscId=1
```

---

### Location Routes

Base route:

```bash
/api/locations
```

Used to manage locations from the admin side.

---

### Industry Routes

Base route:

```bash
/api/industries
```

Used to manage industries from the admin side.

---

### Size Routes

Base route:

```bash
/api/sizes
```

Used to manage company sizes from the admin side.

---

### Job Title Routes

Base route:

```bash
/api/job-titles
```

Used to manage job titles from the admin side.

---

### Weather Routes

Base route:

```bash
/api/weather
```

Used for weather API features.

## Notes

* Make sure the PostgreSQL database is created before starting the backend.
* Make sure the `.env` file contains the correct `DATABASE_URL`.
* The frontend must use the backend API origin where this server is deployed.
* Do not upload the `.env` file to GitHub.
* This backend is connected to the frontend repository for the Nexsus React application.
