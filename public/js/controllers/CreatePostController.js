app.controller('CreatePostController', ['$scope', '$firebaseObject', '$firebaseArray',
    function($scope, $firebaseObject, $firebaseArray) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        $scope.allowedHashtags = [];

        $scope.PostsIsLoading = true;
        $scope.noPosts = false;
        $scope.havePosts = false;

        $scope.PointsIsLoading = true;

        $scope.content = '';

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

                // $scope.allowedHashtags = [];
                const hashtagsRef = DATABASE.child('Hashtags');
                hashtagsRef.once('value').then(function(dataSnapshot) {
                    console.log('hashtagsRef.once: dataSnapshot = ');
                    console.log(dataSnapshot.val());

                    dataSnapshot.forEach(function(childSnapshot) {
                        if (childSnapshot.val().isVisible) {
                            $scope.allowedHashtags.push(childSnapshot.key);
                        }
                        console.log($scope.allowedHashtags);
                    });
                });

                $scope.Usernames = $firebaseArray(DATABASE.child('Usernames'));
            }
        });

        $scope.passUsername = function(username) {
            const TAG = 'passUsername: ';

            var str = '@' + username + ' ';
            $scope.content += str;


            console.log(TAG + username);
        };

        $scope.passHashtags = function(hashtag) {
            const TAG = 'passHashtags: ';


            var str = '#' + hashtag + ' ';
            $scope.content += str;

            console.log(TAG + hashtag);
        };

        $scope.addPost = function() {
            const TAG = 'addPost: ';
            const POST_CONTENT = $scope.content;

            $scope.hashtags = [];
            $scope.point = 0;
            const DATETIME = new Date().getTime();

            // validation - START
            if (POST_CONTENT == null || POST_CONTENT.trim() == '') {
                console.warn(TAG + 'your post is Empty!!! ');
                return alert(TAG + 'your post is Empty!!! ');
            }

            var getPoint = POST_CONTENT.match(/(|\s)*\+(\w+)/g);
            if (getPoint == null) {
                console.warn(TAG + 'at least 1 plustag is required. ');
                return alert(TAG + 'at least 1 plustag is required. ');
            } else {
                if (getPoint.length != 1) {
                    console.warn(TAG + 'maximum 1 plustag is required. ');
                    return alert(TAG + 'maximum 1 plustag is required. ');
                } else {
                    $scope.point = parseInt(getPoint[0].trim().substr(1));
                    console.log(TAG + '$scope.point = ' + $scope.point);

                    if ($scope.point <= 0) {
                        console.warn(TAG + 'at least 1 plustag is required. ');
                        return alert(TAG + 'at least 1 plustag is required. ');
                    }
                }
            }

            var getReceiver = POST_CONTENT.match(/(|\s)*@(\w+)/g);
            if (getReceiver == null) {
                console.warn(TAG + 'at least 1 receiver is required. ');
                return alert(TAG + 'at least 1 receiver is required. ');
            } else {
                if (getReceiver.length != 1) {
                    console.warn(TAG + 'maximum 1 plustag is required. ');
                    return alert(TAG + 'maximum 1 plustag is required. ');
                } else {

                    if (getReceiver[0].trim().substr(1) == $scope.Profile.username) {
                        console.warn(TAG + 'you cannot give point to yourself. ');
                        return alert(TAG + 'you cannot give point to yourself. ');
                    }

                    if (getReceiver[0].trim().substr(1) == 'admin') {
                        console.warn(TAG + 'you cannot give point to admin. ');
                        return alert(TAG + 'you cannot give point to admin. ');
                    }

                    $scope.receiver = getReceiver[0].trim().substr(1);
                    console.log(TAG + '$scope.receiver = ' + $scope.receiver);
                }
            }

            var getHashTags = POST_CONTENT.match(/(|\s)*#(\w+)/g);
            var haveInvalidHashtags = false;
            console.log(getHashTags);
            if (getHashTags == null) {
                console.warn(TAG + 'at least 1 hashtag is required. ');
                return alert(TAG + 'at least 1 hashtag is required. ');
            } else {
                if (getHashTags.length > 4) {
                    console.warn(TAG + 'maximum 3 hashtag is allowed. ');
                    return alert(TAG + 'maximum 3 hashtag is allowed. ');
                } else {
                    getHashTags.forEach(function(hashtag) {
                        if (!$scope.allowedHashtags.includes(hashtag.trim().substr(1))) {
                            haveInvalidHashtags = true;
                            $scope.hashtags = [];
                            console.warn(TAG + 'please use predefined hashtag is allowed. ');
                        } else {
                            console.log(TAG + 'hashtag: ' + hashtag.trim().substr(1));

                            $scope.hashtags.push(hashtag.trim().substr(1));

                            console.log(TAG + 'hashtags = #');
                            console.log($scope.hashtags);
                        }
                    });

                    if ($scope.hashtags.length < 1 || $scope.hashtags.length <= 0 || haveInvalidHashtags == true) {
                        return alert(TAG + 'please use predefined hashtag is allowed. ');
                    }
                }
            }
            // validation - END

            //create post
            const newPostKey = DATABASE.child('Posts').push().key; // get uid
            const postRef = DATABASE.child('Posts').child(newPostKey);
            postRef.set({
                author: $scope.Profile.username,
                author_displayName: $scope.Profile.displayName,
                author_uid: $scope.currentUser.uid,
                content: POST_CONTENT,
                datetime: DATETIME,
                hashtags: $scope.hashtags,
                point: $scope.point,
                receiver: $scope.receiver,
                isVisible: true,
                likesCount: 0
            }).then(function(res) {
                console.log(TAG + 'Success, added Post_ID: ' + newPostKey + ' to Posts. ');

                const sentPostsRef = DATABASE.child('Users').child($scope.currentUser.uid).child('SentPosts').child(newPostKey);
                sentPostsRef.set({
                    author: $scope.Profile.username,
                    author_displayName: $scope.Profile.displayName,
                    author_uid: $scope.currentUser.uid,
                    content: POST_CONTENT,
                    datetime: DATETIME,
                    hashtags: $scope.hashtags,
                    point: $scope.point,
                    receiver: $scope.receiver,
                    isVisible: true,
                    likesCount: 0
                }).then(function(res) {
                    console.log(TAG + 'Success, added Post_ID: ' + newPostKey + ' to SentPosts. ');

                    const userRef = DATABASE.child('Usernames').child($scope.receiver).child('user');
                    userRef.once('value').then(function(dataSnapshot) {
                        console.log('userRef.once: ');
                        console.log(dataSnapshot.val());

                        const receivedPostsRef = DATABASE.child('Users').child(dataSnapshot.val()).child('ReceivedPosts').child(newPostKey);
                        receivedPostsRef.set({
                            author: $scope.Profile.username,
                            author_displayName: $scope.Profile.displayName,
                            author_uid: $scope.currentUser.uid,
                            content: POST_CONTENT,
                            datetime: DATETIME,
                            hashtags: $scope.hashtags,
                            point: $scope.point,
                            receiver: $scope.receiver,
                            isVisible: true,
                            likesCount: 0
                        }).then(function(res) {
                            console.log(TAG + 'Success, added Post_ID: ' + newPostKey + ' to SentPosts. ');
                        });
                    });
                }, function(err) {
                    console.error(TAG + 'Error, failed to add new Post to SentPosts; ' + err);
                });
            }, function(err) {
                console.error(TAG + 'Error, failed to add new Post to Posts; ' + err);
            });

            //update points
            const pointsRef = DATABASE.child('Users').child($scope.currentUser.uid).child('Points');
            pointsRef.transaction(function(data) {
                console.log('pointsRef.transaction: data = ');
                console.log(data);
                if (data != null) {
                    data.current = data.current - $scope.point;
                    data.gave = data.gave + $scope.point;
                }
                return data;
            }, function(err, committed, snapshot) {
                if (err) {
                    console.error('pointsRef.transaction: err = ');
                    console.error(err);
                }
                console.log('pointsRef.transaction: snapshot = ');
                console.log(snapshot.val());
            }).then(function(res) {
                const userRef = DATABASE.child('Usernames').child($scope.receiver).child('user');
                userRef.once('value').then(function(dataSnapshot) {
                    console.log('userRef.once: ');
                    console.log(dataSnapshot.val());

                    const receivedPointRef = DATABASE.child('Users').child(dataSnapshot.val()).child('Points');
                    receivedPointRef.transaction(function(data) {
                        console.log('receivedPointRef.transaction: data = ');
                        console.log(data);
                        if (data != null) {
                            data.received = data.received + $scope.point;
                        }
                        return data;
                    }, function(err, committed, snapshot) {
                        if (err) {
                            console.error('receivedPointRef.transaction: err = ');
                            console.error(err);
                        }
                        console.log('receivedPointRef.transaction: snapshot = ');
                        console.log(snapshot.val());
                    });
                });
            });

            //update hashtag
            $scope.hashtags.forEach(function(hashtag) {
                console.log(hashtag);
                const hashtagsRef = DATABASE.child('Hashtags').child(hashtag);
                hashtagsRef.transaction(function(data) {
                    console.log('hashtagsRef.transaction: data = ');
                    console.log(data);
                    if (data != null) {
                        data.counter++;
                    }
                    return data;
                }, function(err, committed, snapshot) {
                    if (err) {
                        console.error('hashtagsRef.transaction: err = ');
                        console.error(err);
                    }
                    console.log('hashtagsRef.transaction: snapshot = ');
                    console.log(snapshot.val());
                }).then(function(res) {
                    console.log('hashtagsRef.transaction: hashtag = #' + hashtag + ' success. ');

                    const userRef = DATABASE.child('Usernames').child($scope.receiver).child('user');
                    userRef.once('value').then(function(dataSnapshot) {
                        console.log('userRef.once: dataSnapshot = ');
                        console.log(dataSnapshot.val());

                        const receivedHashtagsRef = DATABASE.child('Users').child(dataSnapshot.val()).child('ReceivedHashtags').child(hashtag);
                        receivedHashtagsRef.transaction(function(data) {
                            console.log('receivedHashtagsRef.transaction: data = ');
                            console.log(data);
                            if (data != null) {
                                data.counter++;
                            }
                            return data;
                        }, function(err, committed, snapshot) {
                            if (err) {
                                console.error('receivedHashtagsRef.transaction: err = ');
                                console.error(err);
                            }
                            console.log('receivedHashtagsRef.transaction: snapshot = ');
                            console.log(snapshot.val());

                            // all functions completed                                    
                            console.log('addPost: all functions completed successfully. ');
                        });
                    });
                });
            });



            // empty textarea
            $scope.content = '';
        };


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
        // $scope.toggleLike = function(post) {
        //     const TAG = 'toggleLike: ';

        //     const postRef = DATABASE.child('Posts').child(post.$id);
        //     postRef.transaction(function(data) {
        //         console.log(TAG + 'postRef.transaction: data = ');
        //         console.log(data);
        //         if (data != null) {
        //             if (data.likes != null && data.likes[$scope.currentUser.uid] != null) {
        //                 data.likesCount--;
        //                 data.likes[$scope.currentUser.uid] = null;
        //                 $scope.isLiked = false;
        //             } else {
        //                 data.likesCount++;
        //                 if (data.likes == null) {
        //                     data.likes = {};
        //                 }
        //                 data.likes[$scope.currentUser.uid] = 'active';
        //                 $scope.isLiked = true;
        //             }
        //         }
        //         return data;
        //     }, function(err, committed, snapshot) {
        //         if (err) {
        //             console.error(TAG + 'postRef.transaction: err = ');
        //             console.error(err);
        //         }
        //         console.log(TAG + 'postRef.transaction: snapshot = ');
        //         console.log(snapshot.val());
        //     }).then(function(res) {
        //         const sentPostsRef = DATABASE.child('Users').child(post.author_uid).child('SentPosts').child(post.$id);
        //         sentPostsRef.transaction(function(data) {
        //             console.log(TAG + 'sentPostsRef.transaction: data = ');
        //             console.log(data);
        //             if (data != null) {
        //                 if (data.likes != null && data.likes[$scope.currentUser.uid] != null) {
        //                     data.likesCount--;
        //                     data.likes[$scope.currentUser.uid] = null;
        //                     $scope.isLiked = false;
        //                 } else {
        //                     data.likesCount++;
        //                     if (data.likes == null) {
        //                         data.likes = {};
        //                     }
        //                     data.likes[$scope.currentUser.uid] = 'active';
        //                     $scope.isLiked = true;
        //                 }
        //             }
        //             return data;
        //         }, function(err, committed, snapshot) {
        //             if (err) {
        //                 console.error(TAG + 'sentPostsRef.transaction: err = ');
        //                 console.error(err);
        //             }
        //             console.log(TAG + 'sentPostsRef.transaction: snapshot = ');
        //             console.log(snapshot.val());
        //         }).then(function(data) {

        //             const userRef = DATABASE.child('Usernames').child(post.receiver).child('user');
        //             userRef.once('value').then(function(dataSnapshot) {
        //                 console.log('userRef.once: dataSnapshot = ');
        //                 console.log(dataSnapshot.val());

        //                 const receivedPostsRef = DATABASE.child('Users').child(dataSnapshot.val()).child('ReceivedPosts').child(post.$id);
        //                 receivedPostsRef.transaction(function(data) {
        //                     console.log('receivedPostsRef.transaction: data = ');
        //                     console.log(data);
        //                     if (data != null) {
        //                         if (data.likes != null && data.likes[$scope.currentUser.uid] != null) {
        //                             data.likesCount--;
        //                             data.likes[$scope.currentUser.uid] = null;
        //                             $scope.isLiked = false;
        //                         } else {
        //                             data.likesCount++;
        //                             if (data.likes == null) {
        //                                 data.likes = {};
        //                             }
        //                             data.likes[$scope.currentUser.uid] = 'active';
        //                             $scope.isLiked = true;
        //                         }
        //                     }
        //                     return data;
        //                 }, function(err, committed, snapshot) {
        //                     if (err) {
        //                         console.error('receivedPostsRef.transaction: err = ');
        //                         console.error(err);
        //                     }
        //                     console.log('receivedPostsRef.transaction: snapshot = ');
        //                     console.log(snapshot.val());

        //                     // all functions completed                                    
        //                     console.log(TAG + 'all functions completed successfully. ');
        //                 });
        //             });
        //         });
        //     });
        // };

        // $scope.updatePost = function() {
        //     const TAG = 'updatePost: ';

        //     const id = $scope.id;
        //     var record = $scope.Posts.$getRecord(id);

        //     var hashlink = $scope.content.match(/(|\s)*#(\w+)/g);
        //     $scope.hashtag = (hashlink.length > 0) ? hashlink[0].trim() : 'none';

        //     record.author = $scope.author;
        //     record.content = $scope.content;
        //     record.hashtag = $scope.hashtag;

        //     $scope.Posts.$save(record).then(function(ref) {
        //         console.log(TAG + 'Success, updated Post_ID: ' + ref.key + ' from Posts. ');
        //     }, function(err) {
        //         console.log(TAG + 'Error, failed to update Post to Posts; ' + err);
        //     });

        //     $scope.author = '';
        //     $scope.content = '';

        //     $scope.showAddForm();
        // };

        // $scope.deletePost = function(post) {
        //     const TAG = 'deletePost: ';

        //     $scope.Posts.$remove(post).then(function(ref) {
        //         console.log(TAG + 'Success, removed Post_ID: ' + ref.key + ' from Posts. ');
        //         // update hashtag counter
        //         const hashlinkRef = DATABASE.child('Hashtags').child(post.hashtag);
        //         hashlinkRef.transaction(function(data) {
        //             console.log('hashlinkRef.transaction: hashtag = #' + $scope.hashtag);
        //             console.log('data = ');
        //             console.log(data);
        //             if (data != null) {
        //                 data.counter--;
        //             }
        //             return data;

        //         }, function(error, committed, snapshot) {
        //             if (error) {
        //                 console.error('hashlinkRef.transaction: hashtag = #' + $scope.hashtag + '; ' + ' Transaction failed abnormally!', error);
        //             } else if (!committed) {
        //                 console.warn('hashlinkRef.transaction: hashtag = #' + $scope.hashtag + '; ' + ' Transaction is aborted.');
        //             } else {
        //                 console.log('hashlinkRef.transaction: hashtag = #' + $scope.hashtag + '; ' + ' updated!');
        //             }
        //             console.log('hashlinkRef.transaction: hashtag = #' + $scope.hashtag);
        //             console.log('snapshot = ');
        //             console.log(snapshot.val());
        //         });
        //     }, function(err) {
        //         console.error(TAG + 'Error, failed to remove Post to Posts; ' + err);
        //     });
        // };

        // $scope.trustHtml = function(html) {
        //     return $sce.trustAsHtml(html);
        // };

        $scope.atTagClick = function(event) {
            var tagText = event.target.innerText.trim().substr(1);
            window.location.href = '#!/user/' + tagText;
            // alert('atTagClick, tagText: ' + tagText);
        };

        $scope.hashtagClick = function(event) {
            var tagText = event.target.innerText.trim().substr(1);
            alert('hashtagClick, tagText: ' + tagText);
        };

        // $scope.goToRewardPage = function() {
        //     window.location.href = '#!/reward';
        // };
    }
]);