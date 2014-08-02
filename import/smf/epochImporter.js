var through2 = require('through2');
var epochBoardStream = require('./epochBoardStream');
var epochThreadStream = require('./epochThreadStream');
var epochPostStream = require('./epochPostStream');
var boards = require('../core/boards.js');
var posts = require('../core/posts.js');
var lolipop = require('../lolipop/lolipop');
var lpConfig = require('./config.json');
var lp = lolipop(lpConfig);

var async = require('async');
var concurrency = Number.MAX_VALUE; // Concurrency handled by lolipop

var asyncQueue = async.queue(function (runTask, callback) {
  runTask(callback);
}, concurrency);

asyncQueue.drain = function () {
  lp.end(function () {
    console.log('Import complete.');
  });
}

asyncQueue.push(function (asyncBoardCb) {

  var ebs = epochBoardStream(lp);
  var boardStream = ebs.createBoardStream(null);

  boardStream.pipe(through2.obj(function (boardObject, enc, trBoardCb) {
    boards.import(boardObject, function (err, newBoard) {
      if (err) {
        error(err);
      }

      trBoardCb();  // Don't return.  Async will handle end.

      asyncQueue.push(function (asyncThreadCb) {

        var oldBoardId = newBoard.smf.board_id;
        console.log('boardId: '+oldBoardId);
        var newBoardId = newBoard.id;
        var ets = epochThreadStream(lp);
        var threadStream = ets.createThreadStream(null, oldBoardId, newBoardId);

        threadStream.pipe(through2.obj(function (threadObject, enc, trThreadCb) {
          posts.import(threadObject, function (err, newThread) {
            if (err) {
              error(err);
            }

            trThreadCb();  // Don't return.  Async will handle end.

            asyncQueue.push(function (asyncPostCb) {

              var oldThreadId = newThread.smf.thread_id;
              console.log('threadId: '+oldThreadId);
              var newThreadId = newThread.thread_id;
              var eps = epochPostStream(lp);
              var postStream = eps.createPostStream(null, oldThreadId, newThreadId);

              postStream.pipe(through2.obj(function (postObject, enc, trPostCb) {
                posts.import(postObject, function (err, newPost) {
                  if (err) {
                    error(err);
                  }

                  trPostCb();  // Don't return.  Async will handle end.

                  console.log('postId: '+newPost.smf.post_id);
                });
              }, asyncPostCb));  // When stream is empty, worker is done
            });
          });
        }, asyncThreadCb));  // When stream is empty, worker is done
      });
    });
  }, asyncBoardCb));  // When stream is empty, worker is done
});
