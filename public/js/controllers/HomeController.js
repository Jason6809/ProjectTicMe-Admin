app.controller('HomeController', ['$scope', '$firebaseArray', '$firebaseObject',
    function($scope, $firebaseArray, $firebaseObject) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        $scope.PostsIsLoading = true;
        $scope.noPosts = false;
        $scope.havePosts = false;

        $scope.UsersIsLoading = true;
        $scope.noUsers = false;
        $scope.haveUsers = false;

        $scope.HashtagsIsLoading = true;
        $scope.noHashtags = false;
        $scope.haveHashtags = false;

        // check auth
        $scope.auth = AUTH;
        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser == null) {
                window.location.href = '/';
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            } else {
                console.log('$scope.auth.$onAuthStateChanged: signed in.');

                // fetch posts
                $scope.Posts = $firebaseArray(DATABASE.child('Posts'));
                $scope.Posts.$loaded(function(res) {

                    $scope.PostsIsLoading = false;

                    if ($scope.Posts.length > 1) {
                        $scope.havePosts = true;
                    } else {
                        $scope.PostsIsLoading = false;
                        $scope.noPosts = true;
                    }
                    console.log('$loaded: $scope.Posts.length = ' + $scope.Posts.length);

                }, function(err) {
                    console.error('$scope.Posts.$loaded: ' + err);
                });
                // realtime update posts div
                $scope.Posts.$watch(function(event) {
                    if ($scope.Posts.length > 1) {
                        $scope.havePosts = true;
                        $scope.noPosts = false;
                    } else {
                        $scope.havePosts = false;
                        $scope.noPosts = true;
                    }
                });

                // fetch users
                $scope.Users = $firebaseArray(DATABASE.child('Users'));
                $scope.Users.$loaded(function(res) {

                    $scope.UsersIsLoading = false;

                    if ($scope.Users.length > 1) {
                        $scope.haveUsers = true;
                    } else {
                        $scope.UsersIsLoading = false;
                        $scope.noUsers = true;
                    }
                    console.log('$loaded: $scope.Users.length = ' + $scope.Users.length);

                }, function(err) {
                    console.error('$scope.Users.$loaded: ' + err);
                });
                // realtime update posts div
                $scope.Users.$watch(function(event) {
                    if ($scope.Users.length > 1) {
                        $scope.haveUsers = true;
                        $scope.noUsers = false;
                    } else {
                        $scope.haveUsers = false;
                        $scope.noUsers = true;
                    }
                });

                // // fetch hashtags
                const HashtagsRef = DATABASE.child('Hashtags');
                // realtime update hashtags div
                HashtagsRef.on('value', function(dataSnapshot) {
                    console.log('HashtagsRef.on: dataSnapshot = ');
                    console.log(dataSnapshot.val());

                    var total = 0;

                    dataSnapshot.forEach(function(childSnapshot) {
                        $scope.HashtagsIsLoading = false;
                        $scope.noHashtags = true;
                        $scope.haveHashtags = true;

                        total += childSnapshot.val().counter;
                    });

                    $scope.totalHashtags = total;
                });

                // HashtagsRef.once('value', function(dataSnapshot) {
                //     console.log('HashtagsRef.on: dataSnapshot = ');
                //     console.log(dataSnapshot.val());

                //     $scope.HashtagsIsLoading = false;
                //     $scope.noHashtags = true;
                //     $scope.haveHashtags = true;

                //     var total = 0;

                //     dataSnapshot.forEach(function(childSnapshot) {
                //         total += childSnapshot.val().counter;
                //     });

                //     $scope.totalHashtags = total;
                // });

                $scope.Rewards = $firebaseArray(DATABASE.child('Rewards'));

                const configObj = new $firebaseObject(DATABASE.child('Config').child('Rewards').child('minRedeemablePoint'));
                configObj.$bindTo($scope, 'minRedeemablePoint');
            }
        });
    }
]);