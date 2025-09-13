const express = require("express");
const router = require("./router/router");
const cors = require("cors");
// Create Express webapp
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
// use the router we created in the for the endpoints 
app.use(router);

// Create http server and run it
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Up and running on ${port}!`);
})