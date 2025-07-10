# TEAM SIX (seaX)

# Marine Traffic Project

A comprehensive vessel tracking and monitoring system built with Spring Boot backend and React frontend.
## Project Overview

This project was developed as a team collaboration to create a marine traffic monitoring system that tracks vessel movements, manages zones of interest, filter vessels by type, status, country, 12-Hour Historical Tracking, and other criteria.
For Registered Users privileges: Personal Fleet Management, Zone Management, Secure login system with personalized dashboard.

## Team Members

**Original Development Team:**

| Name |
|--------------------------------|
| ΓΙΩΡΓΟΣ ΤΣΟΜΗΣ |
| ΡΩΜΑΝΟΣ ΠΙΚΑΣΗΣ |
| ΑΝΤΩΝΙΑ ΟΙΚΟΝΟΜΟΥ |
| ΣΟΦΙΑ-ΣΠΥΡΙΔΟΥΛΑ ΜΠΑΝΟΥ |
| ΝΕΟΧΑΡΗΣ ΜΙΧΑΗΛΙΔΗΣ |
| ΜΙΧΑΗΛ-ΑΓΓΕΛΟΣ ΠΑΠΑΔΗΜΟΠΟΥΛΟΣ |

### Team Structure
- **Front-End Team:** Σοφία, Γιώργος, Αντωνία
- **Back-End Team:** Νεοχάρης, Ρωμανός, Μιχάλης

*This repository represents my personal version of the project for portfolio purposes.*

## Features

- **Real-time Vessel Tracking**: Monitor vessel positions and movements
- **Interactive Map Interface**: Visual representation of marine traffic
- **Zone Management**: Create and manage zones of interest
- **Violation Detection**: Automatic detection of vessels entering restricted zones
- **Fleet Management**: Track and manage vessel fleets
- **Historical Data**: View past vessel tracks and movements
- **User Authentication**: Secure login and user management

## Technology Stack

### Backend
- **Java 21** with Spring Boot 3.2.5
- **Spring Security** for authentication
- **JPA/Hibernate** for database management
- **WebSocket** for real-time communication
- **Apache Kafka** for message streaming
- **Docker** for containerization

### Frontend
- **React.js** with modern hooks
- **Leaflet** for interactive maps
- **CSS Modules** for styling
- **Axios** for API communication
- **WebSocket** for real-time updates

## Prerequisites

Before running the application, ensure you have:

- **Docker Desktop** installed on your machine
- **Git** for version control
- **WSL** (for Windows users) or Linux/macOS environment

## Required Data Files

**IMPORTANT**: You need to download additional data files before running the application:

1. **Download AIS Data**:
   - Go to: https://zenodo.org/records/1167595
   - Download the `[P1] AIS Data.zip` file
   - Extract the ZIP file

2. **Copy Required Files**:
   - From the extracted folder, copy these files:
     - `nari_static.csv`
     - `nari_dynamic.csv`
   - Place them in: `back/src/main/resources/`

*Note: These files are too large to include in the GitHub repository, so manual download is required.*

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MikelosR/Marine-Traffic-Project.git
cd Marine-Traffic-Project
```

### 2. Add Required Data Files
Follow the "Required Data Files" section above to add the CSV files.

### 3. Run the Application

#### For WSL/Linux/macOS:
```bash
cd back
./build.sh    # Build Docker images
./start.sh    # Start all containers
```

#### For macOS:
```bash
cd back
./build.sh    # Build Docker images
./start-mac.sh    # Start all containers
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### 5. Stop the Application
```bash
docker-compose down -v
```

## Project Structure

```
Marine-Traffic-Project/
├── back/                          # Backend (Spring Boot)
│   ├── src/main/java/            # Java source code
│   ├── src/main/resources/       # Configuration & data files
│   ├── Dockerfile               # Backend Docker configuration
│   └── docker-compose.yml      # Multi-container setup
├── front/                        # Frontend (React)
│   ├── src/components/          # React components
│   ├── src/pages/              # Application pages
│   ├── src/utils/              # Utility functions
│   └── Dockerfile              # Frontend Docker configuration
└── README.md                   # Project documentation
```

## Development

### Backend Development
The backend is built with Spring Boot and includes:
- REST API endpoints for vessel and zone management
- WebSocket connections for real-time updates
- Kafka integration for data streaming
- JWT authentication system

### Frontend Development
The frontend is a React SPA featuring:
- Interactive map with vessel tracking
- Real-time updates via WebSocket
- Responsive design with CSS modules
- Component-based architecture

## Docker Configuration

The application uses Docker Compose to orchestrate multiple services:
- **Backend Service**: Spring Boot application
- **Frontend Service**: React development server
- **Database**: PostgreSQL
- **Message Broker**: Apache Kafka

## License

This project was developed for educational purposes as part of a university assignment.