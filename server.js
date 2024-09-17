const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'notes',
    password: '1234',
    port: 5432,
});

pool.connect((err, client, release) => {
    if (!err) {
        client.query('SELECT NOW()', (err, result) => {
            release();
            if (!err) console.log(result.rows);
        });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'jwt', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0 || !(await bcrypt.compare(password, user.rows[0].password))) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user.rows[0].id, username: user.rows[0].username }, 'jwt', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/notes', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;
    try {
        await pool.query('INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3)', [userId, title, content]);
        res.status(201).json({ message: 'Note created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/notes', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT * FROM notes WHERE user_id = $1', [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));
