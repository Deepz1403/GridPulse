# GridPulse - Power Data Submission System

## Overview
GridPulse is a backend system designed to streamline power data submission and management. It ensures accurate data logging by allowing only assigned attendants to submit power data to their designated substations. Additionally, it features a verification system where submitted data is reviewed by managers before approval.

## Features
- **Role-based Authentication**: Secure login for attendants and managers.
- **Session Management**: Ensures authenticated and authorized access.
- **Data Submission & Verification**:
  - Attendants submit power data for their assigned substation.
  - If new area is added it is first stored in a `pendingPowerData` collection.
  - The manager reviews and approves or rejects data.
- **Dynamic Substation Management**:
  - Managers can add substations by specifying their name, location, and attendant.
  - Substations are dynamically created as collections.
- **Automated Temperature Fetching**: The system automatically retrieves temperature data based on the substation’s location.
- **Secure Middleware**: Ensures only managers can create substations and assign attendants.

## Tech Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: Bcrypt
- **Session Management**: Express-session
- **Location-based Temperature Fetching**: External API integration

## Installation
```sh
# Clone the repository
git clone https://github.com/yourusername/gridpulse.git
cd gridpulse

# Install dependencies
npm install

# Set up environment variables in a `.env` file
echo "MONGO_URI=your_mongodb_connection_string" >> .env
echo "CLIENT_ORIGIN=your_client_address" >> .env
echo "SESSION_SECRET=your_session_secret" >> .env
echo "WEATHER_API_KEY=your_api_key" >> .env

# Start the server
npm start
```
## API Endpoints
Authentication
```sh
# Login for attendants and managers
POST /attendant/login

# Register a new attendant (Manager only)
POST /attendant/signup
```
Manager only
```sh
## Add a new substation
POST /manager/create-substation

# Managers fetch pending submissions
GET /manager/pending-data

# Manage pending data (Accept or Reject)
POST /manager/pending-data/:id/review
```
Power Data Submission
```sh
# Attendants submit power data
POST /power/submit
```


