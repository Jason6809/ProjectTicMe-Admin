app.controller('UserController', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray',
    function($scope, $routeParams, $firebaseObject, $firebaseArray) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        const USERNAME = $routeParams.username;

        if(USERNAME == 'admin') {
            window.location.href = '#!/';
        }

        $scope.ReceivedPostsIsLoading = true;
        $scope.noReceivedPosts = false;
        $scope.haveReceivedPosts = false;

        $scope.SentPostsIsLoading = true;
        $scope.noSentPosts = false;
        $scope.haveSentPosts = false;

        $scope.ReceivedRewardsIsLoading = true;
        $scope.noReceivedRewards = false;
        $scope.haveReceivedRewards = false;
        $scope.showRewardsTab = false;

        $scope.PointsIsLoading = true;
        $scope.ReceivedHashtagsIsLoading = true;

        //check auth
        $scope.auth = AUTH;
        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser == null) {
                window.location.href = '/';
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            } else {
                //init
                $scope.currentUser = firebaseUser;
                console.log('$scope.auth.$onAuthStateChanged: signed in.');

                console.log($routeParams.username);
                const targetUserRef = DATABASE.child('Usernames').child(USERNAME).child('user');
                targetUserRef.once('value', function(dataSnapshot) {
                    console.log('userRef.once: dataSnapshot = ');
                    console.log(dataSnapshot.val());

                    $scope.targetUserUid = dataSnapshot.val();
                    // get basic user profile info
                    // const userRef = DATABASE.child('Users').child(dataSnapshot.val()).child('Profile');
                    // userRef.once('value').then(function(dataSnapshot) {
                    //     console.log('userRef.once: ');
                    //     console.log(dataSnapshot.val());
                    //     $scope.Profile = dataSnapshot.val();
                    // });

                    // check profile
                    var profileObj = new $firebaseObject(DATABASE.child('Users').child(dataSnapshot.val()).child('Profile'));
                    profileObj.$bindTo($scope, 'Profile');

                    // check points update
                    var PointsObj = new $firebaseObject(DATABASE.child('Users').child(dataSnapshot.val()).child('Points'));
                    PointsObj.$loaded(function(res) {
                        $scope.PointsIsLoading = false;
                    }, function(err) {
                        console.error('PointsObj.$loaded: ' + err);
                    });
                    PointsObj.$bindTo($scope, 'Points');

                    // check hashtags update
                    $scope.ReceivedHashtags = $firebaseArray(DATABASE.child('Users').child(dataSnapshot.val()).child('ReceivedHashtags'));
                    $scope.ReceivedHashtags.$loaded(function(res) {
                        $scope.ReceivedHashtagsIsLoading = false;
                    }, function(err) {
                        console.error('$scope.ReceivedHashtags.$loaded: ' + err);
                    });

                    // get received posts
                    $scope.ReceivedPosts = $firebaseArray(DATABASE.child('Users').child(dataSnapshot.val()).child('ReceivedPosts'));
                    $scope.ReceivedPosts.$loaded(function(res) {

                        $scope.ReceivedPostsIsLoading = false;

                        if ($scope.ReceivedPosts.length > 0) {
                            $scope.haveReceivedPosts = true;
                        } else {
                            $scope.ReceivedPostsIsLoading = false;
                            $scope.noReceivedPosts = true;
                        }
                        console.log('$loaded: $scope.ReceivedPosts.length = ' + $scope.ReceivedPosts.length);

                    }, function(err) {
                        console.error('$scope.ReceivedPosts.$loaded: ' + err);
                    });
                    // realtime update posts div
                    $scope.ReceivedPosts.$watch(function(event) {
                        if ($scope.ReceivedPosts.length > 0) {
                            $scope.haveReceivedPosts = true;
                            $scope.noReceivedPosts = false;
                        } else {
                            $scope.haveReceivedPosts = false;
                            $scope.noReceivedPosts = true;
                        }
                    });

                    // get sent posts
                    $scope.SentPosts = $firebaseArray(DATABASE.child('Users').child(dataSnapshot.val()).child('SentPosts'));
                    $scope.SentPosts.$loaded(function(res) {

                        $scope.SentPostsIsLoading = false;

                        if ($scope.SentPosts.length > 0) {
                            $scope.haveSentPosts = true;
                        } else {
                            $scope.SentPostsIsLoading = false;
                            $scope.noSentPosts = true;
                        }
                        console.log('$loaded: $scope.SentPosts.length = ' + $scope.SentPosts.length);

                    }, function(err) {
                        console.error('$scope.SentPosts.$loaded: ' + err);
                    });
                    // realtime update posts div
                    $scope.SentPosts.$watch(function(event) {
                        if ($scope.SentPosts.length > 0) {
                            $scope.haveSentPosts = true;
                            $scope.noSentPosts = false;
                        } else {
                            $scope.haveSentPosts = false;
                            $scope.noSentPosts = true;
                        }
                    });

                    $scope.checkLikesStatus = function(post) {
                        var likesStatus = $firebaseObject(DATABASE.child('Posts').child(post.$id).child('likes').child($scope.currentUser.uid));
                        return likesStatus;
                    };

                    // get received rewards
                    $scope.ReceivedRewards = $firebaseArray(DATABASE.child('Users').child(dataSnapshot.val()).child('ReceivedRewards'));
                    $scope.ReceivedRewards.$loaded(function(res) {

                        $scope.ReceivedRewardsIsLoading = false;

                        if ($scope.ReceivedRewards.length > 0) {
                            $scope.haveReceivedRewards = true;
                        } else {
                            $scope.ReceivedRewardsIsLoading = false;
                            $scope.noReceivedRewards = true;
                        }
                        console.log('$loaded: $scope.ReceivedRewards.length = ' + $scope.ReceivedRewards.length);

                    }, function(err) {
                        console.error('$scope.ReceivedRewards.$loaded: ' + err);
                    });
                    // realtime update posts div
                    $scope.ReceivedRewards.$watch(function(event) {
                        if ($scope.ReceivedRewards.length > 0) {
                            $scope.haveReceivedRewards = true;
                            $scope.noReceivedRewards = false;
                        } else {
                            $scope.haveReceivedRewards = false;
                            $scope.noReceivedRewards = true;
                        }
                    });

                    if ($scope.currentUser.uid == dataSnapshot.val()) {
                        $scope.showRewardsTab = true;
                    }
                });
            }
        });


        $scope.toggleLike = function(post) {
            const TAG = 'toggleLike: ';

            const postRef = DATABASE.child('Posts').child(post.$id);
            postRef.transaction(function(data) {
                console.log(TAG + 'postRef.transaction: data = ');
                console.log(data);
                if (data != null) {
                    if (data.likes != null && data.likes[$scope.currentUser.uid] != null) {
                        data.likesCount--;
                        data.likes[$scope.currentUser.uid] = null;
                        $scope.isLiked = false;
                    } else {
                        data.likesCount++;
                        if (data.likes == null) {
                            data.likes = {};
                        }
                        data.likes[$scope.currentUser.uid] = 'active';
                        $scope.isLiked = true;
                    }
                }
                return data;
            }, function(err, committed, snapshot) {
                if (err) {
                    console.error(TAG + 'postRef.transaction: err = ');
                    console.error(err);
                }
                console.log(TAG + 'postRef.transaction: snapshot = ');
                console.log(snapshot.val());
            });

            const sentPostsRef = DATABASE.child('Users').child(post.author_uid).child('SentPosts').child(post.$id);
            sentPostsRef.transaction(function(data) {
                console.log(TAG + 'sentPostsRef.transaction: data = ');
                console.log(data);
                if (data != null) {
                    if (data.likes != null && data.likes[$scope.currentUser.uid] != null) {
                        data.likesCount--;
                        data.likes[$scope.currentUser.uid] = null;
                        $scope.isLiked = false;
                    } else {
                        data.likesCount++;
                        if (data.likes == null) {
                            data.likes = {};
                        }
                        data.likes[$scope.currentUser.uid] = 'active';
                        $scope.isLiked = true;
                    }
                }
                return data;
            }, function(err, committed, snapshot) {
                if (err) {
                    console.error(TAG + 'sentPostsRef.transaction: err = ');
                    console.error(err);
                }
                console.log(TAG + 'sentPostsRef.transaction: snapshot = ');
                console.log(snapshot.val());
            });

            const userRef = DATABASE.child('Usernames').child(post.receiver).child('user');
            userRef.once('value').then(function(dataSnapshot) {
                console.log('userRef.once: ');
                console.log(dataSnapshot.val());
                const receivedPostsRef = DATABASE.child('Users').child(dataSnapshot.val()).child('ReceivedPosts').child(post.$id);
                receivedPostsRef.transaction(function(data) {
                    console.log('receivedPostsRef.transaction: data = ');
                    console.log(data);
                    if (data != null) {
                        if (data.likes != null && data.likes[$scope.currentUser.uid] != null) {
                            data.likesCount--;
                            data.likes[$scope.currentUser.uid] = null;
                            $scope.isLiked = false;
                        } else {
                            data.likesCount++;
                            if (data.likes == null) {
                                data.likes = {};
                            }
                            data.likes[$scope.currentUser.uid] = 'active';
                            $scope.isLiked = true;
                        }
                    }
                    return data;
                }, function(err, committed, snapshot) {
                    if (err) {
                        console.error('receivedPostsRef.transaction: err = ');
                        console.error(err);
                    }
                    console.log('receivedPostsRef.transaction: snapshot = ');
                    console.log(snapshot.val());
                });
            });
        };

        $scope.atTagClick = function(event) {
            var tagText = event.target.innerText.trim().substr(1);
            window.location.href = '#!/user/' + tagText;
            // alert('atTagClick, tagText: ' + tagText);
        };

        $scope.hashtagClick = function(event) {
            var tagText = event.target.innerText.trim().substr(1);
            alert('hashtagClick, tagText: ' + tagText);
        };
    }
]);