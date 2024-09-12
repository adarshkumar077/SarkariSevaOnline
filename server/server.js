const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Ensure you have dotenv installed and configured

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB Atlas using the corrected connection string
mongoose.connect(`mongodb+srv://mydreamwillcometrue19:${encodeURIComponent(process.env.DB_PASSWORD)}@cluster09.a7aav.mongodb.net/formDB?retryWrites=true&w=majority&appName=Cluster09`)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define a schema for the form data
const FormSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    district: { type: String, required: true },
    category: { type: String, required: true, default: 'Aadhar' },
}, { timestamps: true });

// Create a model based on the schema
const Form = mongoose.model('Form', FormSchema);

// POST route to handle form submission
app.post('/submit-form', async (req, res) => {
    console.log('Received data:', req.body);

    try {
        if (!req.body.name || !req.body.mobile || !req.body.district || !req.body.category) {
            throw new Error('Missing required fields');
        }

        const newForm = new Form(req.body);
        const savedForm = await newForm.save();
        console.log('Form saved successfully');
        res.status(201).json({
            message: 'Form submitted successfully',
            submission: {
                ...savedForm.toObject(),
                createdAt: savedForm.createdAt
            }
        });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(400).json({ error: error.message || 'Error submitting form' });
    }
});

// GET route to fetch all form submissions
app.get('/admin/submissions', async (req, res) => {
    try {
        const submissions = await Form.find().sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Error fetching submissions' });
    }
});

// DELETE route to remove a submission
app.delete('/admin/submissions/:id', async (req, res) => {
    try {
        const result = await Form.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ error: 'Error deleting submission' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
