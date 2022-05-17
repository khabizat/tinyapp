const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//body-parser library converts Buffer into a readable string 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//create a new route handler and pass the URL data to the template using render
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


//a GET route to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//create a new route handler and pass the URL data to the template using render
app.get("/urls/:shortURL", (req, res) => {
  const myShortURL = req.params.shortURL;
  const templateVars = {
    shortURL: myShortURL,
    longURL: urlDatabase[myShortURL],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (temporary)
});

//a function that returns a string of 6 random alphanumeric characters
function generateRandomString() {
  Math.random().toString(36).slice(2,8);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});