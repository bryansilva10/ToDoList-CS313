const express = require("express");
const bodyParser = require("body-parser"); //to manage/access post request more easily
const date = require(__dirname + "/date.js");
const port = process.env.PORT || 7777; //port for heroku or localhost

const app = express();

const items = ["Buy Food", "Cook Food", "Eat Food"]; //array to store each item after post request
const workItems = [];

app.set("view engine", "ejs"); //set the view engine

app.use(bodyParser.urlencoded({ extended: true })); //needed to parse url requests

app.use(express.static("public")); //server the static files from public (css and more)

app.get("/", function(req, res) {
  let day = date(); //coming from our own date.js module export
  res.render("list", { listTitle: day, newListItems: items }); //render to the view EJS with needed parameters
});

app.get("/work", function(req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/", function(req, res) {
  //route for post requests to the home
  let item = req.body.newItem; //variable to get the user input in the todo list

  if (req.body.list === "Work") {
    //if coming from work list
    workItems.push(item); //push to correct one
    res.redirect("/work"); //redirect to correct one
  } else {
    items.push(item); //push that variable into the array of items at the beginning of program

    res.redirect("/"); //this is sending the variables on the post route to the get route and then we can use them as params to render
  }
});

app.listen(port, function() {
  console.log(`Server running on port ${port}`);
});
