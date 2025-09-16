# React, FastAPI, and Poetry Full-Stack Project

This project is a full-stack web application featuring a modern frontend built with React and Vite, and a robust backend powered by FastAPI. The Python environment and its dependencies are managed using Poetry.

## Features

- **Frontend**: A responsive and fast user interface built with React and Vite, offering an excellent development experience with Hot Module Replacement (HMR).
- **Backend**: A high-performance API built with FastAPI, providing asynchronous capabilities and automatic interactive documentation.
- **Dependency Management**: Python dependencies are managed by Poetry for robust, deterministic, and reproducible environments.
- **Development Server**: The backend is served using Uvicorn, a lightning-fast ASGI server.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Python** (version 3.8 or higher)
- **Poetry** (for Python package management). You can find installation instructions on the [official Poetry website](https://python-poetry.org/docs/).
- **Node.js** (version 18 or higher) and **npm** (or yarn/pnpm).

## Installation

Follow these steps to set up the project on your local machine.

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone https://github.com/TalonExe/fake-invoice-detector.git
cd fake-invoice-detector
```

### 2. Backend Setup (FastAPI & Poetry)

Navigate to the backend directory (e.g., backend/) and use Poetry to install the Python dependencies.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment and install dependencies
poetry install
```

### 3. Frontend Setup (React & Vite)

In a separate terminal, navigate to the frontend directory (e.g., frontend/) and install the Node.js dependencies.

```bash
# Navigate to the frontend directory
cd my-app

# Install npm packages
npm install
```

## Running the Application

To run the application, you will need to start both the backend server and the frontend development server. It's recommended to run them in separate terminal windows.

### 1. Start the Backend Server

Make sure you are in the backend directory. Activate the virtual environment managed by Poetry and start the Uvicorn server.

```bash
# Navigate to the backend directory if you're not already there
cd backend

# Run the uvicorn server
poetry add uvicorn fastapi

# Run the uvicorn server
poetry run main.py
```

The backend API should now be running, typically at http://127.0.0.1:8000. You can access the interactive API documentation at http://127.0.0.1:8000/docs.

### 2. Start the Frontend Development Server

In a new terminal, navigate to the frontend directory and start the Vite development server.

```bash
# Navigate to the frontend directory
cd frontend

# Start the Vite dev server
npm run dev
```
