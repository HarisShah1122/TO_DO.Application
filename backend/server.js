require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is running!");
});
app.use(cors());
app.use(express.json());

sequelize.sync()
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Error syncing database:', err));

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/new-task', async (req, res) => {
    try {
      console.log("Received data:", req.body);  
      const { text, date, completed, status } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Task text is required" });
      }
  
      const newTask = await Task.create({ text, date, completed, status });
      res.status(201).json({ task: newTask });
    } catch (error) {
      console.error("Error adding task:", error);
      res.status(500).json({ error: error.message });
    }
  });
  

app.delete('/delete-task/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.destroy({ where: { id } });
    if (deleted) {
      return res.json({ message: 'Task deleted successfully' });
    }
    res.status(404).json({ error: 'Task not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/update-task/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed, status } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.text = text || task.text;
    task.completed = completed !== undefined ? completed : task.completed;
    task.status = status || task.status;

    await task.save();
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});