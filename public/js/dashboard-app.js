var dashApp = angular.module("dash-app", ['ngRoute'] );
dashApp.config(['$routeProvider', '$httpProvider', function ($routeProvider,$httpProvider) {

    $routeProvider. 
    when('/RegistrationPending', {
        templateUrl: 'job-seeker-complete-registration.html',
        controller:  'RegistrationPending'
    }).
    when('/reg-success', {
        templateUrl: 'registrationSuccessfull.html',
        controller:  'reg-success'
    });
}]);

dashApp.service('sharedProperties', function () {
    var properties = {};

    return {
        getProperty: function (key) {
            return properties.key;
        },
        setProperty: function(key,value) {
            properties.key = value;
        }
    };
});

dashApp.controller('dashboardController', function ($scope, $http,sharedProperties) { 
    jQuery('#overlay').removeClass('hide');
    $http({
        method: 'GET',
        url: '/getUserBasicDetails'
    }).success(function (result) {
        jQuery('#overlay').addClass('hide');
        $scope.dashboardData = result.data;        
        sharedProperties.setProperty('shared_data',$scope.dashboardData);
        if (result.status_code == 401 || result.status_code == '401') {
            jQuery.pnotify({
                text: result.data.Reason,
                type: "error"
            });
            setTimeout(function(){window.location.href = "/index.html";},2000);
        } else {
            if($scope.dashboardData.user_type == 'seeker') {
                $scope.dashboardUrl = "#RegistrationPending";
                window.location.href = "/dashboard.html#/RegistrationPending";
            } else {
                $scope.dashboardUrl = "#oneStepRegistration";
                window.location.href = "/dashboard.html#/oneStepRegistration";
            }    
        }
    });
});


dashApp.controller('RegistrationPending', function ($scope, $http, $routeParams, $location,sharedProperties) {
    var sd = sharedProperties.getProperty('shared_data');
    $scope.user_type =   sd.user_type;
    $scope.check_verified =   sd.is_profile_complete;
    if($scope.check_verified == 1){
        window.location.href = "/dashboard.html#/reg-success";
    }else{


            $scope.personalDetails = {
                    "title" : '',
                    "first_name" : '',
                    "middle_name" : '',
                    "last_name" : '',
                    "dob" : '',
                    'address': {
                        "street_no" : '',
                        "house_no" : '',
                        "street_name" : '',
                        "suburb" : '',
                        "postcode" : '',
                        "city_name" : '',
                        "state_name" : ''
                    },
                    "mobile" : ''
            };
            $scope.stepOne = 0;
            $scope.stepTwo = 1;
            $scope.stepThree = 1;
            $scope.stepFour = 1;
            $scope.stepOneNext = function () {
                 $http({
                  method : "POST",
                  url    : "regPersonalDetails",
                  data   : $scope.personalDetails
                 }).success(function(result) {
                       if (result.status_code == 401 || result.status_code == '401') {
                                jQuery.pnotify({
                                text: result.data.Reason,
                                type: "error"
                            });
                            setTimeout(function(){window.location.href = "/index.html";},2000);
                        }else {
                            if(result.status_code == 200){
                                $scope.stepOne = 1;
                                $scope.stepTwo = 0;
                                $scope.stepThree = 1;
                                $scope.stepFour = 1;
                            }
                        }
                 });
            }

            $scope.jobDetails = {
                    'resume_headline' : '',
                    'job_category' : '',
                    'skill_sets' : '',
                    'preferred_location' : '',
                    'is_relocate' : '',
                    'comments' : '',
                    'total_experience' : '',
                    'current_emp_details': {
                        'yearly_salary' : '',
                        'basis_of_employment' : '',
                        'profession' : '',
                        'industry' : '',
                        'employment_period_years' : '',
                        'employment_period_months' : '',
                        'functional_area' : '',
                        'employment_role' : ''
                    }
            };

            $scope.stepTwoNext = function () {
                 $http({
                  method : "POST",
                  url    : "/regJobDetails",
                  data   : $scope.jobDetails
                 }).success(function(result) {
                        if (result.status_code == 401 || result.status_code == '401') {
                                jQuery.pnotify({
                                text: result.data.Reason,
                                type: "error"
                            });
                            setTimeout(function(){window.location.href = "/index.html";},2000);
                        }else {
                            if(result.status_code == 200){
                                $scope.stepOne = 1;
                                $scope.stepTwo = 1;
                                $scope.stepThree = 0;
                                $scope.stepFour = 1;
                            }
                        }
                 });
            }

            $scope.stepTwoPrevious = function () {
                
                        $scope.stepOne = 0;
                        $scope.stepTwo = 1;
                        $scope.stepThree = 1;
                        $scope.stepFour = 1;
            }

            $scope.stepThreeNext = function () {
                
                        $scope.stepOne = 1;
                        $scope.stepTwo = 1;
                        $scope.stepThree = 1;
                        $scope.stepFour = 0;
            }

            $scope.extraDetails = {
                    'class_10_details' : {
                        'year_of_passing' : '',
                        'school_name' : '',
                        'passing_percentage' : ''
                    },
                    'class_12_details' : {
                        'year_of_passing' : '',
                        'school_name' : '',
                        'passing_percentage' : ''
                    },
                    'b_degree_details' : {
                        'year_of_passing' : '',
                        'school_name' : '',
                        'passing_percentage' : ''
                    },
                    'project_details' : {
                        'project_name' : '',
                        'project_details' : '',
                        'project_link' : ''
                    }
            };

            $scope.stepFourSubmit = function () {
                $http({
                 method : "POST",
                 url    : "/extraDetails",
                 data   : $scope.extraDetails
                }).success(function(result) {
                 if(result.status_code == 200){
                        $scope.stepOne = 1;
                        $scope.stepTwo = 1;
                        $scope.stepThree = 1;
                        $scope.stepFour = 1;
                    }
                });
            }

            $scope.stepThreePrevious = function () {
                        $scope.stepOne = 1;
                        $scope.stepTwo = 0;
                        $scope.stepThree = 1;
                        $scope.stepFour = 1;
            }

            $scope.stepfourPrevious = function () {
                        $scope.stepOne = 1;
                        $scope.stepTwo = 1;
                        $scope.stepThree = 0;
                        $scope.stepFour = 1;
            }
        }
});