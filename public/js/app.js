var app = angular.module('myApp', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainController',
            templateUrl: 'views/main.html'
        }).when('/loader', {
            controller: 'LoaderController',
            templateUrl: 'views/loader.html'
        }).when('/home', {
            controller: 'HomeController',
            templateUrl: 'views/home.html'
        }).when('/user/:username', {
            controller: 'UserController',
            templateUrl: 'views/user.html'
        }).when('/post/:post_uid', {
            controller: 'PostController',
            templateUrl: 'views/post.html'
        }).when('/create-post', {
            controller: 'CreatePostController',
            templateUrl: 'views/create-post.html'
        }).when('/user/admin', {
            redirectTo: '/'
        }).otherwise({
            redirectTo: '/'
        });
}]);