const express = require("express");
const bodyParser = require("body-parser"); //to manage/access post request more easily
const mongoose = require("mongoose"); //require mongoose for data model
const _ = require("lodash"); //for capitalitazion of first characters in routes

const port = process.env.PORT || 7777; //port for heroku or localhost

const app = express();

app.set("view engine", "ejs"); //set the view engine

app.use(bodyParser.urlencoded({ extended: true })); //needed to parse url requests

app.use(express.static("public")); //server the static files from public (css and more)

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect(
  "mongodb+srv://admin-bryan:484848489Bns@cluster0-mnqtb.mongodb.net/todolistDB",
  {
    useNewUrlParser: true
  }
); //first argument is creating a local database, second is getting rid of deprecation warning

//CREATE SCHEMA FOR MONGOOSE DB
const itemsSchema = {
  name: String
};

//CREATE MODEL BASED ON SCHEMA
const Item = mongoose.model("Item", itemsSchema); //first argument is singular name and second is the schema it will be based on

//CREATE NEW DOCUMENTS
const item1 = new Item({
  //creating a new instnace of the model and giving it a value
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

//CREATE SCHEMA FOR CUSTOM LISTS
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//CREATE MODEL FOR CUSTOM LSIT SCHEMA
const List = mongoose.model("List", listSchema);

//ALL ROUTES GET AND POST
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    //check if collection is empty
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        //model.method(the array, callback)
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect("/"); //redirect into this same route and now will fall into ELSE statement below
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems }); //render to the view EJS with needed parameters
    }
  });
});

//NEW GET ROUTE USING CUSTOM PARAMS
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName); //store the route the user wrote

  //find if it already exists, if it does, show it..if it doesn't create it.
  List.findOne({ name: customListName }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create document
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save(); //save new collection
        res.redirect("/" + customListName); //redirect to current custom route
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/", function(req, res) {
  //route for post requests to the home
  const itemName = req.body.newItem; //variable to get the user input in the todo list
  const listName = req.body.list;

  const item = new Item({
    name: itemName //create new documet passing the user input
  });

  //Check if list is default or else if its custom
  if (listName === "Today") {
    item.save(); //save it into collection of items

    res.redirect("/"); //re enter hoem route to render new added items
  } else {
    //find the custom list and add item to correct list
    List.findOne({ name: listName }, function(err, foundList) {
      foundList.items.push(item); //push the item into correct array (items)
      foundList.save(); //save the collection
      res.redirect("/" + listName); //redirect to same get route (custom route)
    });
  }
});

//route for deleting items from list
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox; //this gets the value from checkbox (the item string)
  const listName = req.body.listName; //this will get the list Name from a hidden input value

  if (listName === "Today") {
    //if it is equal to the default list
    //remove normally
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Sucessfully deleted item");
        res.redirect("/"); //redirecting to render again without the already removed item
      }
    });
  } else {
    //delete from custom list using PULL from MONGODB, what we are going to pull is the one that matches the id of the checked item.
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName); //redirect to the same custom list
        }
      }
    );
  }
});

app.listen(port, function() {
  console.log(`Server running on port ${port}`);
});
