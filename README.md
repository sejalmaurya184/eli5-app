# ELI5 – AI-Powered Text Simplification Assistant

ELI5 is a full-stack web application that simplifies complex text into age-appropriate explanations for **5-year-olds, 10-year-olds, and 15-year-olds** using AI. It provides a secure platform where users can register, simplify text, and view their previous requests.

---

## Features

- Age-based text simplification (5, 10, and 15 years)
- User registration and login
- Email verification
- Forgot password and password reset
- JWT-based authentication
- User history management
- Responsive user interface

---

## Tech Stack

### Frontend
- React.js
- Bootstrap
- Axios
- React Router

### Backend
- Node.js
- Express.js
- JWT
- bcryptjs
- Nodemailer

### Database
- MongoDB Atlas

### AI
- Transformer-based NLP API

---

## Project Structure

```
eli5-app/
│
├── backend/
│
├── frontend/
│
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/sejalmaurya184/eli5-app.git
cd eli5-app
```

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=
MONGO_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=
AI_API_KEY=
```

---

## Future Improvements

- Support for PDF and DOCX uploads
- Multiple language support
- Voice-based text simplification
- Export simplified text
- Additional readability levels

---

## Author

**Sejal Maurya**

- GitHub: https://github.com/sejalmaurya184
- LinkedIn: https://www.linkedin.com/in/sejalmaurya184/
