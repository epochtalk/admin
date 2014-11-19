var Charlatan = require('charlatan');
var async = require('async');
var seed = {};
var core = require('epochcore')();
var _ = require('lodash');
var boardsCore = core.boards;
var threadsCore = core.threads;
var postsCore = core.posts;
var usersCore = core.users;
module.exports = seed;

var numBoards = 15;
var maxPosts = 50;
var numUsers = 25;

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

var generateCategories = function(boards) {
  var boardIds = [];
  boards.forEach(function(board) {
    boardIds.push(board.id);
  });

  var groupSize = 3;

  var groups = _.map(boardIds, function(item, index){

    return index % groupSize === 0 ? boardIds.slice(index, index + groupSize) : null;
    })
    .filter(function(item){ return item;

  });

  var randomCat = function () {
    return Charlatan.Helpers.capitalize(Charlatan.Lorem.words(Charlatan.Helpers.rand(5, 3)).join(' '));
  };

  var categories = [{
    name: randomCat(),
    board_ids: groups[0]
  },
  {
    name: randomCat(),
    board_ids: groups[1]
  },
  {
    name: randomCat(),
    board_ids: groups[2]
  },
  {
    name: randomCat(),
    board_ids: groups[3]
  },
  {
    name: randomCat(),
    board_ids: groups[4]
  }];
  return categories;
};

var generateBoard = function() {
  var words = Charlatan.Lorem.words(Charlatan.Helpers.rand(8, 4));
  words[0] = Charlatan.Helpers.capitalize(words[0]);
  var name = words.join(' ');
  var description = Charlatan.Lorem.paragraph(Charlatan.Helpers.rand(10, 3));
  var board = {
    name: name,
    description: description,
  };
  return board;
};

var generateUser = function() {
  var username = Charlatan.Internet.userName();
  var email = Charlatan.Internet.freeEmail(username);
  var password = 'epochtalk';
  var name = Charlatan.Name.firstName() + ' ' + Charlatan.Name.lastName();
  var website = 'http://' + Charlatan.Internet.domainName();
  var btcAddress = Charlatan.letterify(Charlatan.numerify('#??#????????#???#??????????#???##?'));
  var gender = Charlatan.Helpers.sample(['Male', 'Female']);
  var dob = randomDate(new Date(1970, 0, 1), new Date(2005, 0, 1)).getTime();
  var location = Charlatan.Address.city();
  var language = Charlatan.Helpers.sample(['English', 'Spanish', 'Korean', 'Vietnamese', 'Japanese', 'Gibberish']);
  var signature = Charlatan.Helpers.sample([name, undefined, username]);
  var user = {
    create: {
      username: username,
      email: email,
      password: password,
      confirmation: password
    },
    update: {
      name: name,
      website: website,
      btcAddress: btcAddress,
      gender: gender,
      dob: dob,
      location: location,
      language: language,
      signature: signature
    }
  };
  return user;
};

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

var generateThread = function(boardId) {
  var thread = {
    board_id: boardId,
  };
  return thread;
};

var generatePost = function(userId, previousPostTime, threadId, boardId) {
  var words = Charlatan.Lorem.words(Charlatan.Helpers.rand(8, 4));
  words[0] = Charlatan.Helpers.capitalize(words[0]);
  var title = words.join(' ');
  var paragraphCount = Charlatan.Helpers.rand(10, 1);
  var body = Charlatan.Lorem.text(paragraphCount, false, '<br /><br />');
  var createdDate;
  if (previousPostTime) { // generate next post within 1 week of previous
    var oldDate = new Date(previousPostTime);
    var futureDate = new Date(Number(previousPostTime) + 1000 * 60 * 60 * 24 * 7);
    createdDate = randomDate(oldDate, futureDate);
  }
  else { // if this is a top leel post just generate a random date.
    createdDate = randomDate(new Date(2012, 0, 1), new Date());
  }
  var post = {
    title: title,
    body: body,
    user_id: userId
  };
  if (boardId) {
    post.board_id = boardId;
  }
  if (threadId) {
    post.thread_id = threadId;
  }
  return post;
};

function seedUsers(seedUsersCallback) {
  var users = [];
  var i = 0;
  async.whilst(
    function() {
      return i < numUsers;
    },
    function (cb) {
      var user = generateUser();
      usersCore.create(user.create)
      .then(function(createdUser) {
        user.create.id = createdUser.id;
        user.update.id = createdUser.id;
        process.stdout.write('Generating Users: ' + createdUser.id + '\r');
        users.push(user.create);
        return usersCore.update(user.update);
      })
      .then(function() {
        i++;
        cb();
      });
    },
    function (err) {
      if (err) {
        console.log('Error generating users.');
      }
      seedUsersCallback(err, users);
    }
  );
}

function seedBoards(users, parentBoard, seedBoardsCallback) {
  if (parentBoard) {
    var subBoardCount = Charlatan.Helpers.rand(6, 0);
    var randNum = Charlatan.Helpers.rand(10, 0);
    subBoardCount = randNum > 6 ? subBoardCount : 0;
  }
  var boards = [];
  var i = 0;
  async.whilst(
    function() {
      var loopCount = parentBoard ? subBoardCount : numBoards;
      return i < loopCount;
    },
    function (cb) {
      var board = generateBoard();
      if (parentBoard) {
        board.parent_id = parentBoard.id;
      }
      boardsCore.create(board)
      .then(function(createdBoard) {
        process.stdout.write('Generating Boards: ' + createdBoard.id + '\r');
        if (parentBoard) {
          boards.push(createdBoard);
          parentBoard.children_ids = parentBoard.children_ids ? parentBoard.children_ids : [];
          parentBoard.children_ids.push(createdBoard.id);
          boardsCore.update(parentBoard)
          .then(function() {
            i++;
            cb();
          })
          .catch(function(err) {
            cb(err);
          });
        }
        else {
          seedBoards(users, createdBoard, function (err, subBoards) {
            createdBoard.subBoards = subBoards; // add subBoards for top level Boards
            boards.push(createdBoard);
            i++;
            cb(err);
          });
        }
      })
      .catch(function(err) {
        cb(err);
      });
    },
    function (err) {
      if (err) {
        console.log('Error generating boards.');
      }
      seedBoardsCallback(err, boards, users);
    }
  );
}

function seedPosts(board, users, thread, seedPostsCallback) {
  var i = 0;
  var postCount = Charlatan.Helpers.rand(maxPosts, 10);
  async.whilst(
    function() { // generate 1 - maxPosts
      return i < postCount;
    },
    function (cb) {
      var post, threadObj;
      var userId = Charlatan.Helpers.sample(users).id;
      if (thread) { // sub level post
        post = generatePost(userId, thread.created_at, thread.thread_id);
        postsCore.create(post)
        .then(function(createdPost) {
          process.stdout.write('Generating Post: ' + createdPost.id + '\r');
          i++;
          cb();
        })
        .catch(function(err) {
          cb(err);
        });
      }
      else { // create thread
        threadObj = generateThread(board.id);
        threadsCore.create(threadObj)
        .then(function(createdThread) {
          return generatePost(userId, board.created_at, createdThread.id);
        })
        .then(postsCore.create)
        .then(function(createdPost) {
          process.stdout.write('Generating Post: ' + createdPost.id + '\r');
          i++;
          seedPosts(null, users, createdPost, cb);
        })
        .catch(function(err) {
          cb(err);
        });
      }
    },
    function (err) {
      if (err) {
        console.log('Error generating posts.');
      }
      seedPostsCallback(err);
    }
  );
}

function seedTopLevelPosts(boards, users, seedTopLevelPostsCallback) {
  var i = 0;
  async.whilst(
    function() {
      return i < boards.length;
    },
    function (cb) {
      var board = boards[i];
      seedPosts(board, users, null, function(err) { // generate x top level posts per board
        if (board.subBoards && board.subBoards.length > 0) {
          i++;
          seedTopLevelPosts(board.subBoards, users, cb);
        }
        else {
          i++;
          cb(err);
        }
      });
    },
    function (err) {
      if (err) {
        console.log('Error generating posts.');
      }
      seedTopLevelPostsCallback(err, boards);
    }
  );
}

function seedCategories(boards, cb) {
  var cats = generateCategories(boards);
  boardsCore.updateCategories(cats)
  .then(function() {
    cb();
  })
  .catch(function(err) {
    cb(err);
  });
}

seed.seed = function() {
  async.waterfall([
      function(cb) {
        console.log('Seeding users.');
        seedUsers(cb);
      },
      function(users, cb) {
        console.log('\nSeeding boards.');
        seedBoards(users, null, cb);
      },
      function(boards, users, cb) {
        console.log('\nSeeding posts.');
        seedTopLevelPosts(boards, users, cb);
      },
      function(boards, cb) {
        console.log('\nPushing board categories.');
        seedCategories(boards, cb);
      }
    ],
    function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('Database seed complete.');
      }
    }
  );
};
