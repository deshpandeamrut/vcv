vcvApp.controller('SignUpController', function ($scope, $http, $routeParams) {
	$scope.signUpData = {
		"user_type" : "",
		"username" : "",
		"password"  : "",
		"email"     : ""
	};
	$scope.datavariable = {};
	
	$scope.signUp = function () {
		$http({
			method : "POST",
			url    : "register",
			data   : $scope.signUpData
		}).success(function(result) {
			if(result.status_code == 200){
				window.location.href = "dashboard.html";
			}else{
				alert('Oops Something went wrong..Please try once again');
			}
		});
	}

});