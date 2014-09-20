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
			console.log("FFF");
			// if(result.status_code == 200){
				
			// }
			// $scope.datavariable = onAjaxSuccess ;

		});
	}

});