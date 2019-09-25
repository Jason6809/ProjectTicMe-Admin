app.controller('IndexController', ['$scope',
    function($scope) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        $scope.auth = AUTH;

        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser != null) {
                $scope.isLogin = true;
                console.log('$scope.auth.$onAuthStateChanged: signed in.');
            } else {
                $scope.isLogin = false;
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            }
        });

        $scope.signOut = function() {
            $scope.auth.signOut();
            window.location.href = '/';
        };
    }
]);