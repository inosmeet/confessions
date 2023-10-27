import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import { Confession } from "./database/database.js";
import axios from "axios";
import path from "path";

const app = express();
const __dirname = path.resolve();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
  
if (process.env.NODE_ENV === "production") {
  app.use (express.static(path.resolve(__dirname, "./client/build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  });
}

// Display existing confessions
app.post("/admin-panel", async function(req, res){
  const response = await Confession.find({});
  res.send(response);
});

// Removing inappropriate confessions
app.post("/get-list", async function(req, res){
  await Confession.findByIdAndRemove(req.body.id);
});

// Sending confessions to telegram API
app.post("/send-msg", async function(req, res){
  await axios.get(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${req.body.msg}`)
  await Confession.findByIdAndRemove(req.body.id);
});

// Sending confessions to the Database for moderation
app.post("/home", async function(req, res) { 
  const time = new Date().getTime();
  await Confession.insertMany({name: req.body.Name, user: req.body.uid, time: time});
});

app.post("/get-time", async function(req, res){
  const cur = new Date().getTime();
  const response = await Confession.find({user: req.body.uid}).sort('-_id');
  if(response.length === 0){
    res.json(false)
  }else {
    const time = response[0]?.time;
    if(time){
      res.json(time);
    }
  }
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log("Server started successfully!");
});

