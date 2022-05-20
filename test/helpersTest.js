const { assert } = require('chai');
const { getUserByID, getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
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

const testURLs = {
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
    userID: 'user2RandomID'
  }
};

describe('getUserByID', function() {
  it('should return a user object given user ID and user database', function() {
    const user = getUserByID("userRandomID", testUsers);
    const expectedUserObject = testUsers["userRandomID"];
    // Write your assert statement here
    assert.deepEqual(user, expectedUserObject);
  });
  it('should return null if we pass an ID that is not in our database', function() {
    const user = getUserByID("uuserRandomID", testUsers);
    const expectedUserObject = null;
    // Write your assert statement here
    assert.deepEqual(user, expectedUserObject);
  });

});

describe('getUserByEmail', function() {
  it('should return a user ID if email is valid', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });
  it('should return undefined if email is not in database', function() {
    const user = getUserByEmail("user@example.ca", testUsers);
    const expectedUserID = undefined;
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });
});

describe('urlsForUser', function() {
  it('should return an object of all URLs from URL database for one user ID', function() {
    const urls = urlsForUser('user2RandomID', testURLs);
    const expectedURLs = {
      "9sm5xK": {
        longURL: "http://www.google.com",
        userID: 'user2RandomID'
      },
      "hdgc5i": {
        longURL: 'https://www.nytimes.com/',
        userID: 'user2RandomID'
      }};
    // Write your assert statement here
    assert.deepEqual(urls, expectedURLs);
  });
});