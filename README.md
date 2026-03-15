# Gig Workers Platform

Welcome to the Gig Workers Platform! This is a full-stack web application that connects freelancers (gig workers) with people who need services. Think of it like a modern, digital marketplace where you can find jobs or hire talent for various gigs.

## What This Project Does

- **For Gig Workers**: Browse available jobs, apply to them, negotiate terms, and manage your profile.
- **For Employers**: Post job listings, review applications, and communicate with potential hires.
- **Core Features**:
  - User authentication and profiles
  - Job posting and searching
  - Application management
  - Real-time chat for negotiations
  - File uploads for portfolios and job photos

## Tech Stack

- **Backend**: Django (Python web framework) with Django REST Framework for APIs
- **Frontend**: React with Vite for fast development
- **Database**: SQLite (easy to set up, perfect for development)
- **Authentication**: JWT (JSON Web Tokens) for secure login
- **Styling**: Custom CSS with a clean, professional look

## Getting Started

### Prerequisites

Before you start, make sure you have these installed on your computer:

- **Python 3.8+** (for the backend)
- **Node.js and npm** (for the frontend)
- **Git** (to clone the repository)

### Installation

1. **Clone the repository**:
   ```
   git clone https://github.com/your-username/gig-workers-platform.git
   cd gig-workers-platform
   ```

2. **Set up the backend**:
   - Navigate to the backend folder:
     ```
     cd backend
     ```
   - Create a virtual environment:
     ```
     python -m venv venv
     ```
   - Activate the virtual environment:
     - On Windows: `venv\Scripts\activate`
     - On macOS/Linux: `source venv/bin/activate`
   - Install Python dependencies:
     ```
     pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
     ```
   - Run database migrations:
     ```
     python manage.py migrate
     ```

3. **Set up the frontend**:
   - Go back to the root directory:
     ```
     cd ..
     ```
   - Install Node.js dependencies:
     ```
     npm install
     ```

## Running the Project

1. **Start the backend server**:
   - In the `backend` folder (with virtual environment activated):
     ```
     python manage.py runserver
     ```
   - The backend will run on http://127.0.0.1:8000/

2. **Start the frontend server**:
   - In the root directory (in a new terminal):
     ```
     npm run dev
     ```
   - The frontend will run on http://localhost:5173/

3. **Open your browser** and go to http://localhost:5173/ to use the app!

## Project Structure

```
gig-platform/
├── backend/                 # Django backend
│   ├── core/               # Main app with models, views, etc.
│   ├── gig_backend/        # Django project settings
│   ├── db.sqlite3          # Database file
│   └── manage.py           # Django management script
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Main app pages
│   └── services/           # API communication
├── public/                 # Static assets
└── package.json            # Frontend dependencies and scripts
```

## API Endpoints

The backend provides RESTful APIs for:

- User registration and authentication
- Job CRUD operations
- Application management
- File uploads

Check the Django admin at http://127.0.0.1:8000/admin/ for data management.

## Contributing

We'd love your help! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Troubleshooting

- **Backend won't start**: Make sure your virtual environment is activated and all dependencies are installed.
- **Frontend won't load**: Check that the backend is running and CORS is configured properly.
- **Database issues**: Run `python manage.py migrate` to apply any pending migrations.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Happy gigging! If you have questions or need help, feel free to open an issue on GitHub.
