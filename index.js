const express = require("express");
const app = express();
const connectMongoDb = require("./database/database");
const port = process.env.PORT || 5000;
const cors = require("cors");

const movieRoute = require("./routes/movieRoute");
const authRoute = require("./routes/authRoute");
app.use(cors());
app.use(express.json());

app.use("/", authRoute);
app.use("/movies", movieRoute);

app.listen(port, async () => {
  console.log(`app is running on port ${port}`);
  await connectMongoDb();
});
