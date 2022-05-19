const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

//middleware
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.set('view engine', 'ejs');

//function that returns a string of 6 random alphanumeric characters
const generateRandomString = function() {
  return Math.random().toString(36).slice(2,8);
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
 
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//returns user object
const getUserByID = function(id) {
  for (let user in users) {
    if (user === id) {
      return users[user];
    } 
  }
  return null;
}

//checks whether the user is already registered
const emailIsRegistered = function(email, returnUserID = false) {
  for (let userID in users) {
    if (users[userID].email === email) {
      if (returnUserID === false) {
        return true;
      } else {
        return userID;
      }
    }
  }
  return false;
}



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
  const templateVars = {
    urls: urlDatabase,
    user: getUserByID(req.cookies["user_id"]),
  };
  res.render('urls_index', templateVars);
});


//route to show the form
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: getUserByID(req.cookies["user_id"]),
  };
  res.render('urls_new', templateVars);
});


//GET register endpoint
app.get('/register', (req, res) => {
  const templateVars = {
    user: getUserByID(req.cookies["user_id"]),
  };
  res.render('urls_register', templateVars);
});


//GET login endpoint
app.get('/login', (req, res) => {
  const templateVars = {
    user: getUserByID(req.cookies["user_id"]),
  };
  res.render('urls_login', templateVars);
});

//route handler for passing the URL data to the template using render
app.get('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL;
  if (myShortURL === 'register') {
    const templateVars = {
      user: getUserByID(req.cookies["user_id"]),
    };
    return res.render('urls_register', templateVars);
  }
  const templateVars = {
    shortURL: myShortURL,
    longURL: urlDatabase[myShortURL],
    user: getUserByID(req.cookies["user_id"]),
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

//POST route that updates a URL resource
app.post('/urls/:shortURL', (req, res) => {
  console.log(req.params.shortURL);
  const myShortURL = req.params.shortURL;
  urlDatabase[myShortURL] = req.body.newValue;
  res.redirect('/urls');
});

//POST login route
app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const userID = emailIsRegistered(loginEmail, returnUserID = true);
  // console.log(users);
  if (userID === false) {
    // console.log(`${loginEmail} not registered!`);
    res.sendStatus(403);
  }
  const registeredPassword = users[userID].password;
  // console.log(loginPassword + ":" + registeredPassword);
  if (loginPassword !== registeredPassword) {
    // console.log("Wrong password!");
    res.sendStatus(403);
  }
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

//POST logout route
app.post('/logout', (req, res) => {
  const userID = req.cookies['user_id'];
  // console.log(userID);
  res.clearCookie('user_id', userID);
  res.redirect('/urls');
});

//POST register route
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.sendStatus(400);
  }
  if (emailIsRegistered(email, return_bool = true)) {
      res.sendStatus(400);
  } 
  users[userID] = {
  id: userID,
  email: email,
  password: password
  }
  res.cookie('user_id', userID);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});