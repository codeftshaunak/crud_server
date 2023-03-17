const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// enable CORS
app.use(cors());

// start the server
const PORT = process.env.PORT || 4000;

// connect to the database

const uri = "mongodb+srv://sagardey:hZ1Ex7yjd8WJKkOP@cluster0.rpaesbl.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect().then(() => {
    console.log("conneted with db");
})


async function run() {
    try {
        const todoCollection = client.db('nodeMongoCrud').collection('todos');

        app.get('/api/todos', async (req, res) => {
            const query = {};
            const cursor = todoCollection.find(query);
            const todos = await cursor.toArray();
            res.send(todos);
        })

        //get data by id
        app.get('/api/todos/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const todos = await todoCollection.findOne(query);
            res.send(todos)
        })

        //Post method for send data to the backend 
        app.post('/api/todos', async (req, res) => {
            const todo = req.body;
            const result = await todoCollection.insertOne(todo);
            res.send(result);
        });

        // Delete an existing todo item by ID
        app.delete('/api/todos/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await todoCollection.deleteOne(query);
                res.send(result);
                console.log(result);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error deleting item' });
            }
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
            const result = await todoCollection.updateOne(query, updateTask, option)
            res.send(result);
        });

    } catch { }

}

run();

app.get('/', (req, res) => {
    res.send('Vercel Wrking nicely')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
