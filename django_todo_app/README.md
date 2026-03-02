# Peak Task Manager 🚀

A full-stack collaborative task management system built with **Django REST Framework** and **Next.js 15**.

## 🏗 Project Structure
- **/backend**: Django API with JWT Authentication.
- **/frontend**: Next.js dashboard with Tailwind CSS & Shadcn UI.

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver