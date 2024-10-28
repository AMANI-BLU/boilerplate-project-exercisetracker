const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// In-memory data storage
const users = [];
const exercises = [];

// Route for homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// 1. POST /api/users to create a new user
app.post('/api/users', (req, res) => {
    const { username } = req.body;
    const newUser = { username, _id: generateId() };
    users.push(newUser);
    res.json(newUser);
});

// 2. GET /api/users to get all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// 3. POST /api/users/:_id/exercises to add an exercise
app.post('/api/users/:_id/exercises', (req, res) => {
    const userId = req.params._id;
    const user = users.find(user => user._id === userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { description, duration, date } = req.body;
    const exerciseDate = date ? new Date(date) : new Date();

    const exercise = {
        userId,
        description,
        duration: parseInt(duration),
        date: exerciseDate,
        _id: generateId()
    };

    exercises.push(exercise);

    res.json({
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
        _id: user._id
    });
});

// 4. GET /api/users/:_id/logs to retrieve user’s exercise log
app.get('/api/users/:_id/logs', (req, res) => {
    const userId = req.params._id;
    const user = users.find(user => user._id === userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    let userExercises = exercises.filter(ex => ex.userId === userId);

    // Handle query parameters
    const { from, to, limit } = req.query;

    if (from) {
        const fromDate = new Date(from);
        userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
    }
    if (to) {
        const toDate = new Date(to);
        userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
    }

    if (limit) {
        userExercises = userExercises.slice(0, parseInt(limit));
    }

    const log = userExercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
    }));

    res.json({
        username: user.username,
        count: log.length,
        _id: user._id,
        log
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
