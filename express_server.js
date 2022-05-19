const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

//middleware
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.set('view engine', 'ejs');

//function that returns a string of 6 random alphanumeric characters
const generateRandomString = function() {
  return Math.random().toString(36).slice(2,8);
};


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
    userID: 'cookie123'
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
  "cookie123": {
    id: "cookie123",
    email: "kabby@shopify.ca",
    password: "123"
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

//returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = function(id) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    let userID = urlDatabase[shortURL].userID
    if (userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
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
   if (req.cookies['user_id'] === undefined) {
    return res.redirect('/error');
  }
  const userURLs = urlsForUser(req.cookies['user_id']);
  const templateVars = {
    urls: userURLs,
    user: getUserByID(req.cookies["user_id"]),
  };
  res.render('urls_index', templateVars);
}); 


//route to show the form
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: getUserByID(req.cookies["user_id"]),
  };
  if (req.cookies['user_id'] === undefined) {
    console.error('Only logged in users can add new URLs');
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});


//GET register endpoint
app.get('/register', (req, res) => {
  const templateVars = {
    user: getUserByID(req.cookies["user_id"]),
  };
  if (req.cookies['user_id'] !== undefined) {
    return res.redirect('/urls');
  }
  res.render('urls_register', templateVars);
});


//GET login endpoint
app.get('/login', (req, res) => {
  const templateVars = {
    user: getUserByID(req.cookies["user_id"]),
  };
  console.log(req.cookies['user_id'])
  if (req.cookies['user_id'] !== undefined) {
    return res.redirect('/urls');
  }
  res.  render('urls_login', templateVars);
});

app.get('/error', (req, res) => {
   const templateVars = {
  //  urls: userURLs,
   user: getUserByID(req.cookies["user_id"]),
 };
  res.render('urls_error', templateVars);
});

//route handler for passing the URL data to the template using render
app.get('/urls/:shortURL', (req, res) => {
  const myShortURL = req.params.shortURL;
  // if (myShortURL === 'register') {
  //   const templateVars = {
  //     user: getUserByID(req.cookies["user_id"]),
  //   };
  //   return res.render('urls_register', templateVars);
  // }
  const userURLs = urlsForUser(req.cookies['user_id']);
  userHasNoAccess = false;
  if (userURLs[myShortURL] === undefined) {
    userHasNoAccess = true;
  }
  if (req.cookies["user_id"] === undefined || userHasNoAccess) {
    res.redirect('/error');
  }
  const templateVars = {
    shortURL: myShortURL,
    longURL: userURLs[myShortURL].longURL,
    user: getUserByID(req.cookies["user_id"]),
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

//redirect after receiving a POST request
app.post('/urls', (req, res) => {
  if (req.cookies['user_id'] === undefined) {
    console.log('Somebody tried to add a URL without logging in');
    res.status(400).send('Only logged in users can add new URLs');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

//POST route that removes a URL resource
app.post('/urls/:shortURL/delete', (req, res) => {
  const myShortURL = req.params.shortURL;
  const userURLs = urlsForUser(req.cookies['user_id']);
  userHasNoAccess = false;
  if (userURLs[myShortURL] === undefined) {
    userHasNoAccess = true;
  }
  if (req.cookies["user_id"] === undefined || userHasNoAccess) {
    res.status(400).send('This is not your URL or you are not logged in');
  }
  delete urlDatabase[myShortURL];
  res.redirect('/urls');
});

//POST route that updates a URL resource
app.post('/urls/:shortURL', (req, res) => {
  console.log(req.params.shortURL);
  const myShortURL = req.params.shortURL;
  const userURLs = urlsForUser(req.cookies['user_id']);
  userHasNoAccess = false;
  if (userURLs[myShortURL] === undefined) {
    userHasNoAccess = true;
  }
  if (req.cookies["user_id"] === undefined || userHasNoAccess) {
    res.status(400).send('This is not your URL or you are not logged in');
  }
  userURLs[myShortURL].longURL = req.body.newValue;
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
  const correctPassword = bcrypt.compareSync(loginPassword, registeredPassword);
  if (!correctPassword) {
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
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === '' || password === '') {
    res.sendStatus(400);
  }
  if (emailIsRegistered(email, return_bool = true)) {
      res.sendStatus(400);
  } 
  users[userID] = {
  id: userID,
  email: email,
  password: hashedPassword
  }
  res.cookie('user_id', userID);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});