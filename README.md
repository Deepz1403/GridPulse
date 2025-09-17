# GridPulse - Real-time Electric Grid Monitoring System

![GridPulse Logo](https://i.imgur.com/6Zp9Q0f.png)

## Overview

GridPulse is a comprehensive system for real-time monitoring of an electrical grid. It features a dynamic, real-time dashboard to visualize data for both managers and attendants, each with distinct roles and permissions. The system is designed to process and display vital grid data, offering insights and analysis. It also includes an intelligent chatbot to assist users with their queries.

## Features

*   **Real-time Data Visualization:** View live data from grid meters on an interactive dashboard.
*   **Role-Based Access Control:** Separate interfaces and permissions for Managers and Attendants.
*   **Automated Data Extraction:** Utilizes a Raspberry Pi and OCR to automatically capture and process meter readings.
*   **Historical Data Analysis:** Track and analyze historical grid data to identify trends and anomalies.
*   **Intelligent Chatbot:** An integrated chatbot to provide instant support and information to users.
*   **Secure Authentication:** Robust authentication system to ensure data privacy and security.
*   **Hierarchy Visualization:** Interactive tree structure to visualize the grid's hierarchy.

## Tech Stack

### Frontend

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS, shadcn/ui
*   **State Management:** Redux Toolkit
*   **Routing:** React Router
*   **Form Handling:** React Hook Form with Zod for validation
*   **Data Fetching:** Axios, TanStack Query
*   **Charts:** Recharts
*   **Real-time Communication:** Socket.IO Client
*   **UI Components:** Radix UI, Lucide React, Framer Motion

### Backend

*   **Framework:** Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** bcrypt for password hashing
*   **Real-time Communication:** Socket.IO
*   **Chatbot:** LangChain with Google GenAI and/or Ollama
*   **File Handling:** Multer, ExcelJS
*   **Security:** Helmet, CORS, express-rate-limit

### Hardware (Data Acquisition)

*   **Device:** Raspberry Pi
*   **Camera:** PiCamera
*   **OCR:** Custom OCR solution (e.g., Tesseract)

## System Architecture

```
[Raspberry Pi + PiCamera] -> Captures Meter Image
       |
       v
[OCR Engine] -> Extracts Data from Image
       |
       v
[Backend API (Node.js/Express)] -> Stores Data in MongoDB
       |
       v
[Real-time Update (Socket.IO)] -> Pushes Data to Frontend
       |
       v
[Frontend (React)] -> Displays Data on Dashboard
       ^
       |
[User (Manager/Attendant)] -> Interacts with Dashboard & Chatbot
```

## Roles and Permissions

*   **Manager:**
    *   Can view all data and dashboards.
    *   Can manage attendants and their assignments.
    *   Has access to all administrative features.
*   **Attendant:**
    *   Can view data for their assigned substations.
    *   Can enter data manually if required.
    *   Has limited access to the system.

## How to Run the Project

To run this project, you will need to run the `client`, `server`, and `chatbot` applications in separate terminals.

### 1. Server

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm i

# Start the server
npm start
```

### 2. Client

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm i

# Start the client
npm start
```

### 3. Chatbot

```bash
# Navigate to the chatbot directory
cd chatbot

# Install dependencies
npm i

# Start the chatbot
npm start
```
