const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1. Middleware
// IMPORTANT: Configure CORS to allow your React local development address
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(express.json());

// 2. MongoDB Connection String
// Replace the old uri line with this:
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyvbwwz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server (optional for v4.7+)
        // await client.connect();

        // Database and Collections
        const database = client.db("alorDishaDB");
        const registrationsCollection = database.collection("registrations");
        const donationsCollection = database.collection("donations");

        // --- API ROUTES ---

        // Test Route
        app.get('/', (req, res) => {
            res.send('Alor Disha Foundation Server is running properly!');
        });

        // 1. POST: Register a new member/donor/volunteer
        app.post('/registrations', async (req, res) => {
            try {
                const newUser = req.body;
                console.log("Saving Registration:", newUser.email);
                
                const result = await registrationsCollection.insertOne(newUser);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error inserting registration:", error);
                res.status(500).send({ message: "Internal Server Error during registration" });
            }
        });

        // 2. GET: Get all registrations (For Admin Dashboard)
        app.get('/registrations', async (req, res) => {
            try {
                const cursor = registrationsCollection.find().sort({ createdAt: -1 });
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Could not fetch registrations" });
            }
        });

        // 3. POST: Record a donation
        app.post('/donations', async (req, res) => {
            try {
                const donation = req.body;
                const result = await donationsCollection.insertOne(donation);
                res.status(201).send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to record donation" });
            }
        });

        // 4. GET: Get all donations (For Public Transparency or Admin)
        app.get('/donations', async (req, res) => {
            const result = await donationsCollection.find().toArray();
            res.send(result);
        });

        // Ping MongoDB to confirm a successful connection
        console.log("✅ Successfully connected to MongoDB Atlas!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    }
}

// Start the MongoDB logic
run().catch(console.dir);

// Start the Express Server
app.listen(port, () => {
    console.log(`🚀 Server is listening on http://localhost:${port}`);
});