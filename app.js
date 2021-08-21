//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kaish124:reza2580@cluster0.d1c26.mongodb.net/todolistDB", {useNewUrlParser:true,  useUnifiedTopology: true ,useFindAndModify:false});

const itemsSchema = { 
  name:String
};

const Item = mongoose.model("Item", itemsSchema);

const Food = new Item({
  name:"Food"
});

// Food.save();

const Cook = new Item({
  name:"Cook"
});

// Cook.save();

const Eat = new Item({
  name:"Eat"
}); 

// Eat.save();
const defualtItems = [Food, Cook, Eat];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



// Item.deleteOne({_id:"6110006ea917f113c4e11104"}, function(err){
//   if(err){
//         console.log(err);
//       } else {
//         console.log("Succesfully items deleted.");
//       }
// });

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
        Item.insertMany( defualtItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Succesfully items inserted.");
        }
      });
      res.redirect("/");
    } else{

      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

    const item = new Item({
      name: itemName
    });

if(listName === "Today"){

  item.save();
  
  res.redirect("/");
} else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}
     
    
});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(id,function(err){
      if(!err){
        console.log("Succesfully checked item deleted");
        res.redirect("/"); 
      }
    });

  } else{
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:id}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  // console.log(id);
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defualtItems
        });
      
        list.save();
        res.redirect("/" + customListName);
       
      } else {
        
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started succesfully!");
});
