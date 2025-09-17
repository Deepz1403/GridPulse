# Grid Pulse Dashboard

### Login Page

![Login Page](https://github.com/user-attachments/assets/2e7409b3-fcab-4d76-8a58-e78c132122a9)


## Overview

Grid Pulse is an advanced energy monitoring dashboard designed for electrical utility companies to track transformer data, monitor substations, and analyze energy consumption metrics in real-time.

## Features

### Dashboard
- Real-time transformer voltage and current monitoring
- Energy consumption analysis with interactive charts
- Area-wise consumption breakdown
- Comprehensive data logs with search functionality

### Substation Management
- Track multiple substations with detailed information
- Monitor substation status (operational, maintenance, offline)
- View temperature and location data
- GPS coordinates mapping

### Employee Management
- Assign employees to specific substations
- Track employee status and availability
- Searchable employee database

### Data Entry
- Forms for entering transformer and substation data
- Validation for data integrity
- Real-time updates to the dashboard

## Tech Stack

- **Frontend**: React, JavaScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Data Visualization**: Recharts
- **State Management**: React Query
- **Routing**: React Router

## Screenshots

### Dashboard
![DashBoard](https://github.com/user-attachments/assets/b761200e-39ff-45eb-a013-064ae15dec7c)

### Substation Details
![image](https://github.com/user-attachments/assets/a36817e3-84ee-4bbe-acbe-c9f9028cc7b1)
![image](https://github.com/user-attachments/assets/2bfc3fde-adda-47ce-9586-19683e6624b5)

### Employees
![image](https://github.com/user-attachments/assets/7bbbf330-77b4-4afe-92c2-7a95bf0489d3)






### Substation Details
The Substation Details page provides comprehensive information about each substation, including:
- Location and coordinates
- Current temperature
- Operational status
- Assigned employees
- Last update timestamp

### Employee Management
Manage and track employees with:
- Color-coded status indicators
- Substation assignments
- Search and filter capabilities

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/BytecodeElec/grid-pulse.git

# Navigate to project directory
cd grid-pulse

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── data/           # Mock data for demonstration
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
└── App.jsx         # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## About Grid Pulse

Grid Pulse is designed to provide electrical utility companies with real-time insights and analytics for better energy management, grid monitoring, and maintenance planning. The system helps identify potential issues before they become critical, optimize resource allocation, and improve overall grid reliability.
