const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Himanshu:himu2003@cluster0.llvvrtn.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Welcome"
});
const item2 = new Item({
    name: "Hit '+' to add new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany([item1, item2, item3], function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added default items");
                }
                res.redirect("/");
            });
        } else {
            res.render("list", { listTitle: "Today", ListItems: foundItems });
        }
    });
});

app.get("/:title", function (req, res) {
    const customTitle = _.capitalize(req.params.title);

    List.findOne({ name: customTitle }, function (err, foundList) { //title is condition and foundList is result
        if (!err) {
            if (!foundList) {
                //Create new one
                const list = new List({
                    name: customTitle,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customTitle);
            } else {
                //Show existing list
                res.render("list", { listTitle: foundList.name, ListItems: foundList.items });
            }
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({ //Created a Document
        name: itemName
    });

    if (listName === "Today") {
        item.save(); //This will save our collection by itself
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


});

app.post("/delete", function (req, res) {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkItemId, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Successfully deleted");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItemId } } }, function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
});

app.post("/work", function (req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.listen(process.env.PORT || 3000, function () { //process.env.PORT taken care by heroku
    console.log("Server started on port 3000");
});



