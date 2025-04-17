const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Replace with the actual path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* What this does is that it asks express to serve the files on my root directory. path.join() takes in two parameters,
    the absolute path of the server.js file, and the route of a page, like /html_pages/sign_in. Since we don't give a second
    parameter, path.join() just returns the root directory, and we therfore ask express to serve the files in our root directory.
    app.use therfore says: *use* express.static() to serve static files on the path returned by path.join(__dirname), which is just
    the root.
*/

app.use(express.static(path.join(__dirname)));

/* What this does is that it makes it so that when we visit http://localhost:3000/, we see index.html.
    index.html is therefore associated with the address: http://localhost:3000/, but / is shorthand for the http://localhost:3000
*/

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // change 'index.html' to whatever file you want to serve
});

app.use(express.json());

// Create user
app.post('/api/users', async (req, res) => {
  const { name, age } = req.body;
  try {
    const docRef = await db.collection('users').add({ name, age });
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});