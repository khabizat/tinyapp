const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//create a new route handler and pass the URL data to the template using render
app.get("/urls/:shortURL", (req, res) => {
  const myShortURL = req.params.shortURL;
  const templateVars = {
    shortURL: myShortURL,
    longURL: urlDatabase[myShortURL],
  }
  res.render("urls_show", templateVars )
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});