const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// importing helper functions
const { generateRandomString, getUserByID, getUserByEmail, urlsForUser } = require('./helpers');

//middleware
const bodyParser = require("body-parser");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: "session",
  keys: ["la la land", "meow meow"],
})
);

app.set('view engine', 'ejs');


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'user2RandomID'
  },
  "hdgc5i": {
    longURL: 'https://www.nytimes.com/',
    userID: 'user4RandomID'
  }
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
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "hello@hi.hi",
    password: "123"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "little@tree.qq",
    password: "hellothere"
  }

};

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/', (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect('/login');
  }
  return res.redirect('/urls');
});


//route handler for passing the URL data to the template using render
app.get('/urls', (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: userURLs,
    user: getUserByID(req.session.user_id, users),
  };
  //display error page if not logged in
  if (req.session.user_id === undefined) {
    return res.render('urls_error', templateVars);
  }
  res.render('urls_index', templateVars);
});


//route to show the form
app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: getUserByID(req.session.user_id, users),
  };
  res.render('urls_new', templateVars);
});


//route handler for passing the URL data to the template using render
app.get('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL;
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  let userHasNoAccess = false;
  if (userURLs[myShortURL] === undefined) {
    userHasNoAccess = true;
  }
  // user is not logged in and trying to acces link
  if (req.session.user_id === undefined || userHasNoAccess) {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error', templateVars);
  }
  //user logged in and trying to access link that is not in database
  if (req.session.user_id === !undefined && userHasNoAccess === false) {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error', templateVars);
  }

  const templateVars = {
    shortURL: myShortURL,
    longURL: userURLs[myShortURL].longURL,
    user: getUserByID(req.session.user_id, users),
  };
  res.render('urls_show', templateVars);
});


//route for handling redirect links
app.get("/u/:shortURL", (req, res) => {
  const myShortURL = req.params.shortURL;
  if (urlDatabase[myShortURL] === undefined) {
    res.status(400).send('The short URL has not been recognised');
  }
  const longURL = urlDatabase[myShortURL].longURL;
  res.redirect(longURL);
});

//GET register endpoint
app.get('/register', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: getUserByID(req.session.user_id, users),
  };
  res.render('urls_register', templateVars);
});


//GET login endpoint
app.get('/login', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: getUserByID(req.session.user_id, users),
  };
  res.  render('urls_login', templateVars);
});


//redirect after receiving a POST request
app.post('/urls', (req, res) => {
  //if user is not logged in and trying to access a list of links
  if (req.session.user_id === undefined) {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error', templateVars);
  }
  //if user is logged in and creates new short URL
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//POST route that removes a URL resource
app.post('/urls/:shortURL/delete', (req, res) => {
  const myShortURL = req.params.shortURL;
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  let userHasNoAccess = false;
  if (userURLs[myShortURL] === undefined) {
    userHasNoAccess = true;
  }
  if (req.session.user_id === undefined || userHasNoAccess) {
    res.status(400).send('This is not your URL or you are not logged in');
  }
  delete urlDatabase[myShortURL];
  res.redirect('/urls');
});

//POST route that updates a URL resource
app.post('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL;
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  let userHasNoAccess = false;
  if (userURLs[myShortURL] === undefined) {
    userHasNoAccess = true;
  }
  if (req.session.user_id === undefined || userHasNoAccess) {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error', templateVars);
  }
  userURLs[myShortURL].longURL = req.body.newValue;
  res.redirect('/urls');
});

//POST register route
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === '' || password === '') {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error_register', templateVars);
  }
  if (getUserByEmail(email, users) !== undefined) {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error_register', templateVars);
  }
  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userID;
  res.redirect('/urls');
});


//POST login route
app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const userID = getUserByEmail(loginEmail, users);
  if (userID === undefined) {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error_login', templateVars);
  }
  const registeredPassword = users[userID].password;
  const correctPassword = bcrypt.compareSync(loginPassword, registeredPassword);
  if (!correctPassword) {
    const templateVars = {
      user: getUserByID(req.session.user_id, users),
    };
    res.render('urls_error_login', templateVars);
  }
  req.session.user_id = userID;
  res.redirect('/urls');
});

//POST logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});