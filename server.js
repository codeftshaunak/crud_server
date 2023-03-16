const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// enable CORS
app.use(cors());

// connect to the database
mongoose.connect('mongodb+srv://sagardey:sagardey@cluster0.rpaesbl.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to the database!");
}).catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
});

// define a simple schema for our Todo model
const todoSchema = mongoose.Schema({
    projectname: String,
    taskname: String,
    taskdescription: String,
    acceptancecriteria: String,
    deadline: Date,
    assigne: String,
}, {
    timestamps: true
});

// create a Todo model from the schema
const Todo = mongoose.model('Todo', todoSchema);

async function run() {

    // define the routes for our API
    app.get('/api/todos', (req, res) => {
        Todo.find()
            .then(todos => {
                res.send(todos);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving todos."
                });
            });
    });

    //get data by id
    app.get('/api/todos/:id', (req, res) => {
        const id = req.params.id;
        Todo.findById(id)
            .then(todos => {
                res.send(todos);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Something Is Wrong"
                })
            })
    })

    //Post method for send data to the backend 
    app.post('/api/todos', (req, res) => {
        const todo = new Todo(req.body);

        todo.save()
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the todo."
                });
            });
    });


    // Edit an existing todo item by ID
    app.put('/api/todos/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updatedData = req.body;
        const option = { upsert: true };
        const updateTask = {
            $set: {
                projectname: updatedData.projectname,
                taskname: updatedData.taskname,
                taskdescription: updatedData.taskdescription,
                acceptancecriteria: updatedData.acceptancecriteria,
                deadline: updatedData.deadline,
                assigne: updatedData.assigne
            }
        }
        const result = await Todo.updateOne(query, updateTask, option)
        res.send(result);
    });

    // Delete an existing todo item by ID
    app.delete('/api/todos/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await Todo.deleteOne(query);
            res.send(result);
            console.log(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error deleting item' });
        }
    });

}

run();

// start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
