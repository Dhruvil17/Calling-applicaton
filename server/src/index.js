const express = require("express");
const router = require("./router/router");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(router);

app.post("/", (req, res) => {
  res.json({ message: "POST request received successfully!", data: req.body });
});

const port = process.env.PORT || 3000;
app.listen(port,() => {
    console.log(`Up and running on ${port}!`);
})