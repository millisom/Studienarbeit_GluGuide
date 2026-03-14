const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

// Configuration imports
const corsOptions = require('./config/corsConfig');
const sessionConfig = require('./config/sessionConfig');
const setupMiddleware = require('./config/middlewareConfig');
const setupRoutes = require('./config/routesConfig');

// Load environment variables
dotenv.config();

// 1. Zuerst CORS (Damit das Frontend Zugriff hat)
app.use(cors(corsOptions));
console.log("CORS allowed origins:", corsOptions.origin);

// 2. Session & Middleware (Parser für JSON etc.)
sessionConfig(app);
setupMiddleware(app);

// 3. Statische Dateien (Bilder)
// Es ist besser, dies nach CORS zu platzieren
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Erst danach die API-Routen
setupRoutes(app);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:8080`);
});