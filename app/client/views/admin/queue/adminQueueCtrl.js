angular.module("reg").controller("AdminQueueCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "UserService",
  "$http",
  "$window",
  function($scope, $state, $stateParams, UserService, $http, $window) {
    $scope.stats = [];
    $scope.users = [];
    $scope.displayedUsers = [];
    $scope.queryText = "";

    // Semantic-UI moves modal content into a dimmer at the top level.
    // While this is usually nice, it means that with our routing will generate
    // multiple modals if you change state. Kill the top level dimmer node on initial load
    // to prevent this.
    $(".ui.dimmer").remove();

    $scope.$watch("queryText", function(queryText) {
      $scope.filterUsers(queryText);
    });

    $scope.filterUsers = function(queryText) {
      $scope.displayedUsers = [];

      if (queryText === "") {
        $scope.displayedUsers = $scope.users;
        return;
      }

      $scope.users.forEach(function(user) {
        var queryLowerCase = queryText.toLowerCase();
        var nameLowerCase = user.profile.name.toLowerCase();
        if (nameLowerCase.indexOf(queryLowerCase) > -1) {
          $scope.displayedUsers.push(user);
        }
      });
    };

    UserService.getQueue().success(function(data) {
      $scope.stats = data.stats;
      $scope.users = data.users;
      $scope.displayedUsers = $scope.users;
    });

    $scope.acceptAllFromQueue = function($event, user, index) {
      swal(
        {
          title: "Whoa, wait a minute!",
          text: "You are about to accept all users from the queue!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, accept them.",
          closeOnConfirm: false
        },
        function() {
          swal(
            {
              title: "Are you sure?",
              text:
                "Your account will be logged as having accepted all users from the queue. " +
                "Remember, this power is a privilege.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, accept the queued users.",
              closeOnConfirm: false
            },
            function() {
              UserService.admitQueue().success(function(user) {
                $scope.users[index] = user;
                swal(
                  "Accepted",
                  "All queued users have been accepted!",
                  "success"
                );
              });
            }
          );
        }
      );
    };

    $scope.removeFromQueue = function($event, user, index) {
      $event.stopPropagation();

      swal(
        {
          title: "Whoa, wait a minute!",
          text:
            "You are about to remove " + user.profile.name + " from the queue!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, remove them.",
          closeOnConfirm: false
        },
        function() {
          UserService.removeQueue(user._id).success(function(user) {
            $scope.users[index] = user;
            swal(
              "Removed",
              user.profile.name + " has been removed from the queue.",
              "success"
            );
          });
        }
      );
    };

    $scope.goUser = function($event, user) {
      $event.stopPropagation();

      $state.go("app.admin.user", {
        id: user._id
      });
    };

    $scope.addToQueue = function() {
      if (!$scope.queuelist || $scope.queuelist === "") {
        return;
      }
      var emailList = $scope.queuelist.split("\n");
      var getEmailPromises = [];
      var addQueuePromises = [];

      for (index in emailList) {
        const email = emailList[index];
        const getEmailPromise = UserService.getByEmail(email).then(function(
          response
        ) {
          return response.data;
        });
        getEmailPromises.push(getEmailPromise);
      }
      Promise.all(getEmailPromises)
        .then(function(values) {
          for (index in values) {
            const user = values[index];
            const addQueuePromise = UserService.addQueue(user._id).then(
              returnUser => {
                if (returnUser.data === null) {
                  throw {
                    message: "User not verified",
                    email: user.email
                  };
                }
              }
            );
            addQueuePromises.push(addQueuePromise);
          }
        })
        .then(() => {
          return Promise.all(addQueuePromises)
            .then(function() {
              swal({
                title: "Queued",
                text: "All users have been queued!",
                type: "success",
                timer: 500
              });
            })
            .catch(errorData => {
              swal({
                title: errorData.email + " failed to be queued",
                text: errorData.message,
                type: "error",
                timer: 750
              });
            });
        })
        .catch(errorData => {
          swal({
            title: errorData.data.email + " not found",
            text: errorData.data.message,
            type: "error",
            timer: 1000
          });
          return errorData;
        });
    };
  }
]);
