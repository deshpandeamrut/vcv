var homepage = angular.module('homepage',[]);

homepage.controller('homepageController',['$scope', '$http',
	function ($scope, $http) {
		$scope.currentAuctions = {};
		$http({
            method  : 'POST',
            url     : '/currentJobs',
        }).success(function(data) {
        	$scope.currentAuctions = data.data;
        });
        $scope.forgotPasswordData = {
        	"email" : ""
        };

		$scope.forgotPassword = function() {
			if(!$scope['forgotPasswordForm'].$valid) {
		        jQuery.pnotify({
	                      text: "Invalid form",
	                      type: 'error'
	                  });
		       return;
		    }
			$scope.loading = true;
			$http({
				method : 'POST',
				url : 'password/reset',
				data: $scope.forgotPasswordData
			}).success(function(data) {
				 $scope.loading = false;
				 if(data.status_code == 200 || data.status_code =="200" ){
				 	 $scope.successMessage = data.data.Reason;
	                  jQuery.pnotify({
	                      text: $scope.successMessage,
	                      type: 'success'
	                  });
	                  jQuery('#forgotPasswordModal').modal('hide');
				 } else {
				 	 $scope.errorMessage = data.data.Reason;
	                  jQuery.pnotify({
	                      text: $scope.errorMessage,
	                      type: 'error'
	                  });
				 }	

			});
		}
		$scope.submitSignIn = function(){
		    $( "#sign-in-form .input-field" ).trigger('input').trigger('change').trigger('keydown').blur();
		     console.log($scope['signInForm'].$valid);
		     console.log($scope.signInData);
		    	if(!$scope['signInForm'].$valid) {
			       console.log('invalid form');
			       return;
		    	}else{
			      console.log('valid form');
			      $scope.loading = true;
			      $http({
			        method  : 'POST',
			        url     : 'login',
		            data    : $scope.signInData  // pass in data as strings
		           }).success(function(data) {
		              console.log(data);
		              $scope.loading = false;
		               if(data.status_code!=200){
		                  $scope.isError = true;
		                  $scope.displayError = data.data.Reason;
		                  console.log($scope.displayError)
		                  jQuery.pnotify({
		                      text: $scope.displayError,
		                      type: 'error'
		                  });
		                }else{
		                $scope.isError = false;
		                $scope.isBorrower = data.data.is_borrower;
		                if(data.data.user_type == "admin") {
		                    window.location.href = "/adminDashboard.html#";
		                    return false;
		                }
		                if($scope.isBorrower) {
                  			window.location.href = "/dashboard.html#/RegistrationPending"
                		} else {
                   			window.location.href = "/dashboard.html#/oneStepRegistration"
                		}
		              }
		            });
          	}   
        }
	}]
)	
