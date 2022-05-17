const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

//body-parser library converts Buffer into a readable string 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

//a function that returns a string of 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(36).slice(2,8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
 
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//route handler for passing the URL data to the template using render
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


//route to show the form
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});



//route handler for passing the URL data to the template using render
app.get('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL;
  const templateVars = {
    shortURL: myShortURL,
    longURL: urlDatabase[myShortURL],
  };
  res.render('urls_show', templateVars);
});

//route for handling redirect links
app.get("/u/:shortURL", (req, res) => {
  const myShortURL = req.params.shortURL;
  const longURL = urlDatabase[myShortURL];
  res.redirect(longURL);
});

//redirect after receiving a POST request
app.post('/urls', (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString(); //???
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//POST route that removes a URL resource
app.post('/urls/:shortURL/delete', (req, res) => {
  const myShortURL = req.params.shortURL;
  delete urlDatabase[myShortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});