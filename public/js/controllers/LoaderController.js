app.controller('LoaderController', ['$scope',
    function($scope) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        $scope.auth = AUTH;

        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser == null) {
                window.location.href = '/';
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            } else {
                console.log('$scope.auth.$onAuthStateChanged: signed in.');

                const AdminRef = DATABASE.child('Admin').orderByKey().equalTo(firebaseUser.uid);
                AdminRef.once('value').then(function(dataSnapshot) {
                    console.log('AdminRef.once: dataSnapshot = ');
                    console.log(dataSnapshot.val());

                    if (dataSnapshot.exists() != true || dataSnapshot.val() == null || dataSnapshot.val() == '') {
                        $scope.auth.signOut();
                        window.location.href = '/';
                    } else {
                        window.location.href = '#!/home';
                    }

                }).catch(function(err) {
                    console.log('AdminRef.once: err = ');
                    console.log(err);
                    
                    $scope.auth.signOut();
                    window.location.href = '/';
                });
            }
        });
    }
]);