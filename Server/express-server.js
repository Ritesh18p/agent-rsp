require("dotenv").config();

const express = require("express");
const connectDB = require("./Config/db");
const userRoutes = require("./Routes/userRoutes");
const noteRoutes = require("./Routes/NoteRoutes");
const cors = require("cors");
const aiRoutes = require("./Routes/AIRoutes");
const agentRoutes = require("./Routes/AgentRoutes");


// Create an Express application
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/agent", agentRoutes);

// Define the port number
const PORT = 5000;

// Home Route
app.get("/", (req, res) => {
    res.send(" Welcome to Notebook Backend!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});