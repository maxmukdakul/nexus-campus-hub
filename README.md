# Nexus: Integrated Campus Resource Hub

## Project Description
Nexus is a centralized web platform designed for university students and staff to manage academic resources, book specialized equipment (like DLSRs, VR headsets, and lab kits), and share peer-reviewed study materials in a structured, searchable environment. The system solves the critical problems of resource fragmentation, equipment double-booking, and lack of transparency by providing a secure, real-time digital booking and approval engine.

## System Architecture Overview
Nexus implements a strict **Layered Architecture Style** to separate concerns and ensure high maintainability and data integrity.

* **Presentation Layer (Frontend):** A React.js Single Page Application (SPA) providing a dynamic, role-based User Interface. It handles state management and conditionally renders components based on the active user's permissions.
* **Business Layer (Backend):** A Django REST Framework API that processes business logic. It handles JSON Web Token (JWT) issuance, enforces Role-Based Access Control (RBAC), and validates complex transactional logic (e.g., database-level query checks to explicitly prevent overlapping booking time slots).
* **Data Layer (Database):** A relational database storing structured entity relationships (Users, Equipment, Bookings, and Study Materials) while enforcing ACID compliance.

## User Roles & Permissions
The system implements strict Role-Based Access Control (RBAC) with three distinct tiers:

1.  **Student (End-User)**
    * **Hardware:** Can browse the catalog and submit booking requests. Can only view their own booking history.
    * **Digital Materials:** Can upload study materials for peer review. Can download approved public materials.
2.  **Staff (Lab Manager)**
    * **Hardware:** Possesses a global view of all active reservations across the system. Has the authority to **Approve** or **Reject** student booking requests.
    * **Digital Materials:** Acts as an academic moderator. Reviews pending student uploads and approves them for public access.
3.  **System Admin (Platform Architect)**
    * Inherits all Staff capabilities.
    * **System Control:** Has exclusive access to the "System Control Panel" to perform complete CRUD operations, including adding new hardware assets to the database or deleting retired equipment.

## Technology Stack
* **Frontend:** React.js, Vite, Context API (for Auth state)
* **Backend:** Python, Django, Django REST Framework (DRF)
* **Authentication:** JSON Web Tokens (JWT) via `djangorestframework-simplejwt`
* **Database:** SQLite (Local Development) / PostgreSQL (Production)
* **Architecture Visualization:** CodeCharta (RawTextParser)

## Installation & Setup Instructions

### Prerequisites
* Python 3.10+
* Node.js (v18+) & npm
* Git

### 1. Backend Setup
```python
# Navigate to the backend directory
cd backend 

# Create and activate a virtual environment
python -m venv venv
# On Windows: 
venv\\Scripts\\activate
# On Mac/Linux: 
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py makemigrations users
python manage.py migrate

# Create initial superuser (Admin)
python manage.py createsuperuser
```

### 2. Frontend Setup
```python
# Navigate to the frontend directory
cd ../frontend

# Install node modules
npm install
```

### 3. How to run
* terminal 1
```python
cd backend
# Ensure virtual environment is active
python manage.py runserver
```

The API will run on
http://127.0.0.1:8000/

* terminal 2
```python
cd frontend
npm run dev
```
The frontend will run on 
http://localhost:5173/
