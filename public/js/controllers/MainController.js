app.controller('MainController', ['$scope', '$firebaseObject',
    function($scope, $firebaseObject) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        $scope.auth = AUTH;

        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser != null) {
                window.location.href = '#!/loader';
                console.log('$scope.auth.$onAuthStateChanged: signed in.');
            } else {
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            }
        });

        $scope.login = function() {
            const TAG = 'login: ';
            // console.log(TAG + '$scope.email: ' + $scope.email + ' $scope.pwd: ' + $scope.pwd);
            $scope.auth.signInWithEmailAndPassword($scope.email, $scope.pwd).then(function(firebaseUser) {
                console.log(TAG + 'success. ');
            }).catch(function(err) {
                console.error(TAG + err);
                alert(err.message);
            });
        };
    }
]);