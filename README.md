# Notlify

A modern note-taking application with AI-powered features built using Spring Boot and React.

## Features

- 📝 Create, edit, and organize notes
- 🔍 Smart search functionality
- 🤖 AI-powered suggestions and completions using GPT
- 👤 User authentication and authorization
- 💾 MongoDB database for data persistence
- 🎨 Modern and responsive UI

## Tech Stack

### Backend
- Java Spring Boot
- MongoDB
- JWT Authentication
- OpenAI GPT Integration

### Frontend
- React
- TypeScript
- Modern UI Components
- Responsive Design

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js and npm
- MongoDB
- OpenAI API key

### Environment Variables
Create the following environment variables:
```
MONGODB_DATABASE=your_database_name
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_api_key
```

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```
2. Install dependencies:
```bash
./mvnw install
```
3. Run the application:
```bash
./mvnw spring-boot:run
```

### Frontend Setup
1. Navigate to the client directory:
```bash
cd client
```
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```

## Contributing
Feel free to submit issues and pull requests.

## License
MIT License 
