vcvApp.controller('loginController', function ($scope, $http, $routeParams) {
	$scope.loginData = {
		"username" : "",
		"password"  : ""		
	};
	$scope.datavariable = {};
	
	$scope.login = function () {
		$http({
			method : "POST",
			url    : "login",
			data   : $scope.loginData
		}).success(function(result) {
			if(result.status_code == 200){
				window.location.href = "dashboard.html";
			}
		});
	}
// $location.path("/RegistrationPending");
});