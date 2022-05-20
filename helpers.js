//returns a string of 6 random alphanumeric characters
const generateRandomString = function() {
  return Math.random().toString(36).slice(2,8);
};

//returns matching user
const getUserByID = function(id, users) {
  for (let user in users) {
    if (user === id) {
      return users[user];
    }
  }
  return null;
};

//returns user ID that matches with a given email from a user database
const getUserByEmail = function(email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return undefined;
};

//returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = function(id, urlDatabase) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    let userID = urlDatabase[shortURL].userID;
    if (userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

module.exports = { generateRandomString, getUserByID, getUserByEmail, urlsForUser };