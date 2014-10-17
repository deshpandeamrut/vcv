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

vcvApp.controller('SignIn', function ($scope, $http, $routeParams, $location) {
	console.log("SignIn");
	$scope.signUpData = {
		"title" : "",
		"first_name" : "",
		"middle_name"  : "",
		"surname"     : ""
	};
	$scope.stepOne = 0;
	$scope.stepTwo = 1;
	$scope.stepThree = 1;
	
	$scope.stepOneNext = function () {
		// $http({
		// 	method : "POST",
		// 	url    : "API",
		// 	data   : $scope.signUpData
		// }).success(function(result) {
		// 	if(result.status_code == 200){
				$scope.stepOne = 1;
				$scope.stepTwo = 0;
				$scope.stepThree = 1;
			// }

		// });
	}

	$scope.stepTwoNext = function () {
		// $http({
		// 	method : "POST",
		// 	url    : "API",
		// 	data   : $scope.signUpData
		// }).success(function(result) {
		// 	if(result.status_code == 200){
				$scope.stepOne = 1;
				$scope.stepTwo = 1;
				$scope.stepThree = 0;
			// }

		// });
	}
	$scope.stepTwoPrevious = function () {
		
				$scope.stepOne = 0;
				$scope.stepTwo = 1;
				$scope.stepThree = 1;
	}
	$scope.stepThreeSubmit = function () {
		// $http({
		// 	method : "POST",
		// 	url    : "API",
		// 	data   : $scope.signUpData
		// }).success(function(result) {
		// 	if(result.status_code == 200){
				$scope.stepOne = 1;
				$scope.stepTwo = 1;
				$scope.stepThree = 1;
			// }

		// });
	}
	$scope.stepThreePrevious = function () {
				$scope.stepOne = 1;
				$scope.stepTwo = 0;
				$scope.stepThree = 1;
	}
});