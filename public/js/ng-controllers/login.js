vcvApp.controller('loginController', function ($scope, $http, $routeParams) {
	$scope.loginData = {
		"username" : "",
		"password"  : ""		
	};
	$scope.datavariable = {};
	
	$scope.login = function () {
		console.log("heloo");
		window.location.href = "signin.html";
		// $http({
		// 	method : "POST",
		// 	url    : "login",
		// 	data   : $scope.loginData
		// }).success(function(result) {
		// 	// if(result.status_code == 200){
				
		// 	// }
		// 	// $scope.datavariable = onAjaxSuccess ;

		// });
// $location.path("/RegistrationPending");
	}

});