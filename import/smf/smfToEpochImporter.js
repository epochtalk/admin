var through2 = require('through2');
var epochBoardStream = require(__dirname + '/smfToEpochStream/epochBoardStream');
var epochThreadStream = require(__dirname + '/smfToEpochStream/epochThreadStream');
var epochPostStream = require(__dirname + '/smfToEpochStream/epochPostStream');
var core = require('../../../core');
var mysqlQuerier = require(__dirname + '/mysqlQuerier/mysqlQuerier');
var mQConfig = require(__dirname + '/config.json');
var mQ = mysqlQuerier(mQConfig);

var async = require('async');
var concurrency = Number.MAX_VALUE; // Concurrency handled by lolipop

var asyncQueue = async.queue(function (runTask, callback) {
  runTask(callback);
}, concurrency);

asyncQueue.drain = function () {
  mQ.end(function () {
    console.log('Import complete.');
  });
}

asyncQueue.push(function (asyncBoardCb) {

  var ebs = epochBoardStream(mQ);
  var boardStream = ebs.createBoardStream(null);

  boardStream.pipe(through2.obj(function (boardObject, enc, trBoardCb) {
    core.boards.import(boardObject, function (err, newBoard) {
      if (err) {
        error(err);
      }

      trBoardCb();  // Don't return.  Async will handle end.

      asyncQueue.push(function (asyncThreadCb) {

        var oldBoardId = newBoard.smf.board_id;
        console.log('boardId: '+oldBoardId);
        var newBoardId = newBoard.id;
        var ets = epochThreadStream(mQ);
        var threadStream = ets.createThreadStream(null, oldBoardId, newBoardId);

        threadStream.pipe(through2.obj(function (threadObject, enc, trThreadCb) {
          core.posts.import(threadObject, function (err, newThread) {
            if (err) {
              error(err);
            }

            trThreadCb();  // Don't return.  Async will handle end.

            asyncQueue.push(function (asyncPostCb) {

              var oldThreadId = newThread.smf.thread_id;
              console.log('threadId: '+oldThreadId);
              var newThreadId = newThread.thread_id;
              var eps = epochPostStream(mQ);
              var postStream = eps.createPostStream(null, oldThreadId, newThreadId);

              postStream.pipe(through2.obj(function (postObject, enc, trPostCb) {
                core.posts.import(postObject, function (err, newPost) {
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
