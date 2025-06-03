import express from 'express';
import Customer from '../models/Customer.js';
import Segment from '../models/Segment.js';
import buildMongoQuery from '../utils/buildMongoQuery.js';

const router = express.Router();

// Route to preview the number of customers matching a given set of rules
router.post('/preview', async (req, res) => {
    try {
        // Validate that rules are provided in the request body
        if (!req.body.rules) {
            return res.status(400).json({ error: 'Rules are required' });
        }

        // Log the incoming rules for debugging purposes
        console.log("Received rules for preview:", req.body.rules);

        // Build the MongoDB query object from the natural language rules
        // The buildMongoQuery utility handles parsing and potential date calculations
        const query = await buildMongoQuery(req.body.rules);

        // Log the generated MongoDB query for debugging
        console.log("Generated MongoDB query:", JSON.stringify(query, null, 2));

        // Count the number of customers that match the generated query
        const count = await Customer.countDocuments(query);

        // Send back the count of matched customers
        res.json({ matched: count });
    } catch (err) {
        // Log the error for server-side debugging
        console.error("Error in /preview endpoint:", err);
        // Send a 400 status with a generic error message for the client
        res.status(400).json({ error: 'Invalid rules format or query generation failed.' });
    }
});

// Route to save a new segment based on a name, rules, and creator
router.post('/save', async (req, res) => {
    try {
        const { name, rules, createdBy } = req.body;

        // Validate that all required fields are present
        if (!name || !rules || !createdBy) {
            return res.status(400).json({ error: 'Missing required fields: name, rules, or createdBy.' });
        }

        // Build the MongoDB query from the natural language rules
        const query = await buildMongoQuery(rules);

        // Find all customers that match the generated query and select only their _id
        // Customer.find() will return an empty array if no matches, not null/undefined,
        // so the previous check `if (!matchedCustomers)` was not necessary here.
        const matchedCustomers = await Customer.find(query).select('_id').lean(); // .lean() for performance if not modifying docs

        // Extract just the _id values into an array
        const customerIds = matchedCustomers.map(c => c._id);

        // Create a new segment document in the database
        const segment = await Segment.create({
            name,
            rules, // Store the original natural language rules
            createdBy,
            customerIds // Store the IDs of matched customers
        });

        // Send back the newly created segment
        res.status(201).json(segment); // Use 201 status for successful creation
    } catch (err) {
        // Log the error for server-side debugging
        console.error("Error in /save endpoint:", err);
        // Send a 400 status with an error message for the client
        res.status(400).json({ error: 'Failed to save segment. Please check input data.' });
    }
});

// Route to fetch all segments, populated with creator details
router.get('/fetch', async (req, res) => {
    try {
        // Fetch all segments
        const segments = await Segment.find()
            // Populate the 'createdBy' field with 'name' and 'email' from the referenced User model
            .populate({
                path: "createdBy",
                select: "name email",
            })
            // Sort the segments by creation date in descending order (newest first)
            // .sort() should be chained directly before .exec() or the final await.
            .sort({ createdAt: -1 });
        // .exec(); // .exec() is optional when awaiting the query directly

        // Send back the fetched segments
        res.json(segments);
    } catch (err) {
        // Log the error for server-side debugging
        console.error("Error in /fetch endpoint:", err);
        // Send a 500 status for server-side errors during fetching
        res.status(500).json({ error: 'Failed to fetch segments.' });
    }
});

export default router;