const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const app = express();


const corsOptions = require('./config/corsConfig');
const sessionConfig = require('./config/sessionConfig');
const setupMiddleware = require('./config/middlewareConfig');
const setupRoutes = require('./config/routesConfig');


dotenv.config();


app.use(cors(corsOptions));
console.log("CORS allowed origins:", corsOptions.origin);


sessionConfig(app);
setupMiddleware(app);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


setupRoutes(app);


require('./cron/sendReminders'); 


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:8080`);
});