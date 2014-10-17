var vcvApp = angular.module("vcv", ['ngRoute'] );
vcvApp.config(['$routeProvider', '$httpProvider', function ($routeProvider,$httpProvider) {

    $routeProvider. when('/', {
        templateUrl: 'signin.html',
        controller:  'SignIn'
    });

}]);