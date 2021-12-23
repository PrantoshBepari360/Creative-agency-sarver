const express = require("express");
const app = express();

// middleware
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const fileUpload = require("express-fileupload");
app.use(cors());
app.use(express.json()); // stringify data k json a convart korar jonno
app.use(fileUpload());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.vh8a9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("creative-agency");
    const usersCollection = database.collection("users");
    const orderCollection = database.collection("order");
    const reviewCollection = database.collection("review");
    const serviceCollection = database.collection("service");

    // set the database single order collection
    app.post("/order", async (req, res) => {
      const name = req.body.name;
      const email = req.body.email;
      const design = req.body.design;
      const project = req.body.project;
      const price = req.body.price;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const order = {
        name: name,
        email: email,
        design: design,
        project: project,
        price: price,
        image: imageBuffer,
      };
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

     // get the database all order
     app.get("/order", async (req, res) => {
      const cursor = orderCollection.find({});
      const order = await cursor.toArray();
      res.json(order);
    });

    // get the database single order for email
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const order = await cursor.toArray();
      res.json(order);
    });

    // set the database single review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

      // get the database all review
      app.get("/review", async (req, res) => {
        const cursor = reviewCollection.find({});
        const result = await cursor.toArray();
        res.json(result);
      });

    // set the database single service
    app.post("/service", async (req, res) => {
      const title = req.body.title;
      const description = req.body.description;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const service = {
        name: title,
        description: description,
        image: imageBuffer,
      };
      const result = await serviceCollection.insertOne(service);
      res.json(result);
    });

    // get the database all service
    app.get("/service", async (req, res) => {
      const corsor = serviceCollection.find({});
      const result = await corsor.toArray();
      res.json(result);
    })

    // set the database single user email an name
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // google email update database
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { emil: user.emil };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // varify admin for databasepoint
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // add user admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Creative Agency");
});

app.listen(port, () => {
  console.log("Listen on port", port);
});
