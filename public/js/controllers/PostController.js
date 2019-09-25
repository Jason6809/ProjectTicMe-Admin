app.controller('PostController', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray',
    function($scope, $routeParams, $firebaseObject, $firebaseArray) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        const POST_UID = $routeParams.post_uid;

        $scope.post_uid = POST_UID;

        $scope.PostsIsLoading = true;
        $scope.noPosts = false;
        $scope.havePosts = false;

        $scope.PointsIsLoading = true;

        //check auth
        $scope.auth = AUTH;
        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser == null) {
                window.location.href = '/';
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            } else {
                //init
                $scope.currentUser = firebaseUser;

                // get basic user profile info
                const ProfileRef = DATABASE.child('Users').child($scope.currentUser.uid).child('Profile');
                ProfileRef.once('value').then(function(dataSnapshot) {
                    console.log('ProfileRef.once: dataSnapshot =');
                    console.log(dataSnapshot.val());
                    $scope.Profile = dataSnapshot.val();
                });

                var PointsObj = new $firebaseObject(DATABASE.child('Users').child($scope.currentUser.uid).child('Points'));
                PointsObj.$loaded(function(res) {
                    $scope.PointsIsLoading = false;
                }, function(err) {
                    console.error('PointsObj.$loaded: ' + err);
                });
                PointsObj.$bindTo($scope, 'Points');


                console.log('$scope.auth.$onAuthStateChanged: signed in.');

                // check posts update
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

                $scope.checkLikesStatus = function(post) {
                    var likesStatus = new $firebaseObject(DATABASE.child('Posts').child(post.$id).child('likes').child($scope.currentUser.uid));
                    return likesStatus;
                };

                // get post comments
                $scope.getPostsComments = function(post) {
                    var comments = $firebaseArray(DATABASE.child('Posts').child(post.$id).child('comments'));
                    return comments;
                };

                // check hashtags update
                $scope.Hashtags = $firebaseArray(DATABASE.child('Hashtags').orderByChild('counter').limitToLast(3));                
            }
        });




        $scope.comment = [];
        $scope.addComment = function(post, comment, index) {
            const TAG = 'addComment: ';
            const COMMENT = comment;

            $scope.comment[index] = '';

            const DATETIME = new Date().getTime();

            // validation - START
            if (COMMENT == null || COMMENT.trim() == '') {
                console.warn(TAG + 'your comment is Empty!!! ');
                return alert(TAG + 'your comment is Empty!!! ');
            }

            const newCommentKey = DATABASE.child('Posts').child(post.$id).child('comments').push().key;
            const commentRef = DATABASE.child('Posts').child(post.$id).child('comments').child(newCommentKey);
            commentRef.set({
                author: $scope.Profile.username,
                author_displayName: $scope.Profile.displayName,
                author_uid: $scope.currentUser.uid,
                content: COMMENT,
                datetime: DATETIME,
                isVisible: true
            }).then(function(res) {
                console.log(TAG + 'success to add comment_id = ' + newCommentKey + ' to post_id = ' + post.$id);
            });
        };

        // toggle like
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
            }).then(function(res) {
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
                }).then(function(data) {

                    const userRef = DATABASE.child('Usernames').child(post.receiver).child('user');
                    userRef.once('value').then(function(dataSnapshot) {
                        console.log('userRef.once: dataSnapshot = ');
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

                            // all functions completed                                    
                            console.log(TAG + 'all functions completed successfully. ');
                        });
                    });
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

        $scope.goToRewardPage = function() {
            window.location.href = '#!/reward';
        };
    }
]);