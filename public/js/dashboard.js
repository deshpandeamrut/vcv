// Starting of Angularjs app

// Angularjs issue https://github.com/angular/angular.js/issues/5103
// setValidity have to set valid and invalid also.

 // 'use strict';

var isOnGitHub = window.location.hostname === 'blueimp.github.io',
        url = isOnGitHub ? '//jquery-file-upload.appspot.com/' : 'js/jQuery-File-Upload/server/php/index.php';



var dashboardApp = angular.module('dashboardApp', ['ngRoute', 'angularFileUpload', 'blueimp.fileupload']);
dashboardApp.config(['$routeProvider','$httpProvider','fileUploadProvider',
// dashboardApp.config(['$routeProvider',

function ($routeProvider,$httpProvider,fileUploadProvider) {
    $routeProvider.
    when('/RegistrationPending', {
        templateUrl: 'registrationPending.html',
        controller: 'registrationPending'
    }).
    when('/', {
        templateUrl: 'clickDashBoard.html',
        controller: 'defaultController'
    }).
    when('/yourProperties', {
        templateUrl: 'yourProperties.html',
        controller: 'yourProperties'
    }).
    when('/searchAddProperties', {
        templateUrl: 'searchAddProperties.html',
        controller: 'formController'
    }).
    when('/investorProperty',{
        templateUrl : 'investorProperty.html',
        controller : 'investorProperty'
    }).
    when('/addProperty', {
        templateUrl: 'addProperty.html',
        controller: 'addProperty'
    }).
    when('/successPage', {
        templateUrl: 'successPage.html',
        // controller: 'addProperty'
    }).
    when('/myBids',{
        templateUrl: 'myBids.html',
        controller: 'myBids'
    }).
    when('/messageCenter',{
        templateUrl: 'messageCenter.html',
        controller: 'messageCenter'
    }).
    when('/oneStepRegistration', {
        templateUrl: 'oneStepRegistration.html',
        controller: 'oneStepRegistration'
    });

    delete $httpProvider.defaults.headers.common['X-Requested-With'];
        fileUploadProvider.defaults.redirect = window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        );
        if (isOnGitHub) {
            // Demo settings:
            angular.extend(fileUploadProvider.defaults, {
                // Enable image resizing, except for Android and Opera,
                // which actually support image resizing, but fail to
                // send Blob objects via XHR requests:
                disableImageResize: /Android(?!.*Chrome)|Opera/
                    .test(window.navigator.userAgent),
                maxFileSize: 5000000,
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
            });
        }
}]);

dashboardApp.controller('defaultController', function ($scope, $http, sharedProperties) {
    var userType = sharedProperties.getProperty('userType');
    if(userType == 'borrower') {
        window.location.href = "/dashboard.html#/RegistrationPending"
    } else {
        window.location.href = "/dashboard.html#/oneStepRegistration"
    }
}); 


dashboardApp.controller('messageCenter',['$scope','$http', '$upload',
function ($scope,$http,$upload) {

    $scope.filesList =  [];

    $scope.replyMessageData = {
        "content" : "",
        "subject" : "",
        "parent_message_id" : ""
    }
    $scope.inboxMessages = {};
    $scope.sentItemsData = {};

    $scope.messageData = {
        "content" : "",
        "subject" : "",
        "parent_message_id" : ""
    }

    $scope.archiveItemsData = {
        "parent_message_id" : ""
    }

    // $scope.personalDetails.files_reference = {}
    $scope.onFileSelect = function($files,$event) {
        console.log($files);
        //$files: an array of files selected, each file has name, size, and type.
        // for (var i = 0; i < $files.length; i++) {
        //     file = $files[i];
        // }
        // var key = $event.currentTarget.name
        // $scope.personalDetails.files_reference[key] = $event.currentTarget.value;
        $scope.filesList = $files;
        console.log($scope.filesList);
    }

    
    $scope.retrieveInbox = function() {
        jQuery('.archiveImg').addClass('hide');
        $scope.deleteElementsId = [];
        $scope.iMessageClose();
        jQuery('#overlay').removeClass('hide'); 
        $http({
            method: 'GET',
            url : 'message/inbox'
        }).success(function(data) {
            $scope.inboxMessages = data.data;
            jQuery('#overlay').addClass('hide'); 
        });
    }

    $scope.iMessageClose = function() {
        jQuery('.single-chat').addClass('hide');
        jQuery('.allMessagesTabs').removeClass('hide');
        $scope.replyMessageData.subject = '';
        $scope.replyMessageData.content = "";
       // window.location.href = passingUrl;
       $scope.filesList =  [];
       jQuery('.replyFileUploadWrap').find('.uploadfile').text('');
    }

    
    $scope.retrieveSentItems = function() {
        $scope.deleteElementsId = [];
        $scope.iMessageClose();
        $http({
            method: 'GET',
            url : 'message/sent'
        }).success(function(data) {
            $scope.sentItemsData = data.data;
        });
    } 

    $scope.trashItemsData = {};
    $scope.retrieveTrashItems = function() {
        $scope.deleteElementsId = [];
        $scope.iMessageClose();
        $http({
            method: 'GET',
            url : 'message/trash'
        }).success(function(data) {
            $scope.trashItemsData = data.data;
        });
    } 

    $scope.retrieveInbox();


    $scope.sendMessage = function() {
        if (!$scope['composeEmailForm'].$valid) {
            console.log('invalid form');
                jQuery.pnotify({
                  text: "Invalid form",
                  type: 'error'
                });
            return false;
        } else {
            console.log('form is valid');
        }
        jQuery('#overlay').removeClass('hide');  

        $scope.upload = $upload.upload({
            method : 'POST',
            url : 'message/compose',
            data : $scope.messageData,
            file: $scope.filesList,
            // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
            /* set file formData name for 'Content-Desposition' header. Default: 'file' */
            // fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
            /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
            //formDataAppender: function(formData, key, val){} //#40#issuecomment-28612000
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        console.log("hrere");
        // file is uploaded successfully
        jQuery('#overlay').addClass('hide');  
         if (data.status_code == '200' || data.status_code == 200) {
            $scope.retrieveInbox();
            $scope.retrieveSentItems();
            var message = "Message sent successfully";
            jQuery.pnotify({
              text: message,
              type: 'success'
            });
           $scope.closeCompose();
        } else {
            $scope.response = data.data.Reason;
            jQuery.pnotify({
              text: $scope.response,
              type: 'error'
            });
        }
     });
    }

    $scope.loadMessages = function() {
        $scope.retrieveInbox();
    }

    $scope.closeCompose = function() {
        $('.compose-mail').hide();
        $scope.messageData.subject = '';
        $scope.messageData.content = "";
        // window.location.href = passingUrl;
        $scope.filesList =  [];
        jQuery('.composeFileUploadWrap').find('.uploadfile').text('');
    }

    $scope.openCompose  = function() {
        $scope.filesList =  [];
        $('.compose-mail').show();
        $scope.iMessageClose();
    }

    $scope.replyMessage = function(id) {
         if (!$scope['replyEmailForm'].$valid) {
            console.log('invalid form');
                jQuery.pnotify({
                  text: "Invalid form",
                  type: 'error'
                });
            return false;
        } else {
            console.log('form is valid');
        }
        $scope.replyMessageData.parent_message_id = id;
        jQuery('#overlay').removeClass('hide');  
        $scope.upload = $upload.upload({
            method : 'POST',
            url : 'message/compose',
            data : $scope.replyMessageData,
            file: $scope.filesList,
            // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
            /* set file formData name for 'Content-Desposition' header. Default: 'file' */
            // fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
            /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
            //formDataAppender: function(formData, key, val){} //#40#issuecomment-28612000
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
            jQuery('#overlay').addClass('hide');  
             if (data.status_code == '200' || data.status_code == 200) {
                $scope.retrieveInbox();
                $scope.retrieveSentItems();
                $scope.viewThread 
                var message = "Message sent successfully";
                jQuery.pnotify({
                  text: message,
                  type: 'success'
                });
                $scope.replyMessageData.subject = '';
                $scope.replyMessageData.content = "";
                $scope.viewThread(id);
               // window.location.href = passingUrl;
               $scope.filesList =  [];
               jQuery('.replyFileUploadWrap').find('.uploadfile').text('');
            } else {
                $scope.response = data.data.Reason;
                jQuery.pnotify({
                  text: $scope.response,
                  type: 'error'
                });
            }
        });

    }

    $scope.messagesThread = {};
    $scope.viewThread = function(id) {
        $scope.closeCompose();
        $scope.filesList =  [];
        // jQuery('.messageNavTabs').find('.active').removeClass('active');
        $http({
            method : 'GET',
            url: 'message/inboxDetails?parent_message_id='+id,
        }).success(function(data) {
            console.log(data);
            $scope.messagesThread = data.data;
            jQuery('.single-chat').removeClass('hide');
            jQuery('.allMessagesTabs').addClass('hide');
            $scope.replyMessageData.subject = $scope.messagesThread.sub;
            $scope.updateRead = {}
            $scope.updateRead.parent_message_id = id;
            $http({
                method : "POST",
                url : "message/read",
                data :$scope.updateRead
            }).success(function(data) {
                console.log(data);
            })
        })
    }
    $scope.deleteElementsId = [];
    $scope.deleteRow = function (id,$event) {
        if($event.target.checked) {
           $scope.deleteElementsId.push(id);
        } else {
            for (var i = 0; i < $scope.deleteElementsId.length; i ++) {
                if ($scope.deleteElementsId[i] == id) { 
                    $scope.deleteElementsId.splice(i, 1);
                    break;
                }
            }
        }
        if($scope.deleteElementsId.length > 0) {
           jQuery('.archiveImg').removeClass('hide');
       } else {
           jQuery('.archiveImg').addClass('hide');
       }
        console.log($scope.deleteElementsId);
    }



    $scope.archiveItems = function() {
        jQuery('#overlay').removeClass('hide');  
        $scope.archiveItemsData.parent_message_id = JSON.stringify($scope.deleteElementsId);
        $http({
            method : "POST",
            url : "message/delete",
            data : $scope.archiveItemsData
        }).success(function(data) {
            $scope.retrieveInbox();
            $scope.retrieveSentItems();
            jQuery('#overlay').addClass('hide');  
            console.log(data);
        });
    }
}
])

dashboardApp.controller('investorProperty',['$scope','$http','$upload',
function ($scope,$http,$upload){
    $scope.showOwnInstalBlock = true;
    $scope.showRentToOWnBlock = true;
    $scope.investorPropertyId = '';
    $scope.propertDetails = {
        "address" : {
            "street_no" : "",
            "street_name" : "",
            "suburb" : "",
            "post_code" : "",
            "city" : "",
            "state" : ""
        },

        "num_beds" : "",
        "parking" : "",
        "num_bath_rooms" : "",
        "land_size" : "",
        "property_description" : ""

    }

    $scope.financialDetails = {
        "property_id" : "",
        "type_of_sale" : "both",
        "own_rent" : {
            "selling_price" : "",
            "deposit_required" : "",
            "rent_amount" : "",
            "rent_own_amount" : "",
            "rent_own_period" : ""
        },
        "pay_by_instal" : {
            "selling_price" : "",
            "deposit_required" : "",
            "interest_rate" : "",
            "minimum_period" : "",
            "penality" : ""
        }
    }

    $scope.ownByInstalClick = function() {
        $scope.showOwnInstalBlock = true;
        $scope.showRentToOWnBlock = false;
    }

    $scope.rentToOWnClick = function() {
        $scope.showRentToOWnBlock = true;
        $scope.showOwnInstalBlock = false;
    }

    $scope.bothSelect = function() {
        $scope.showRentToOWnBlock = true;
        $scope.showOwnInstalBlock = true;
    }

    $scope.propertyDetails = function(queue) {
        $scope.upload = $upload.upload({
            url: "AddInvestorProperty",
            method : 'POST',
            data : $scope.propertDetails,
            file : queue
        }).success(function(data) {
            if (data.status_code == '200' || data.status_code == 200) {
                jQuery.pnotify({
                  text: data.data.Reason,
                  type: 'success'
                });
                $scope.investorPropertyId = data.data.property_id;
                var activeTab = $('#investorPropertyUpload .investorTabs >  .active');
                activeTab.removeClass('active');
                activeTab.next('li').addClass('active');

                var activeContentTab = $('#investorPropertyUpload .tab-content > .active');
                activeContentTab.removeClass('active in');
                activeContentTab.next('.tab-pane').addClass('active in');
            } else {
                jQuery.pnotify({
                  text: data.data.Reason,
                  type: 'error'
                });
            }
        });
    }

    $scope.financialDetailsSubmit = function() {
        console.log($scope.financialDetails);
        $scope.financialDetails.property_id = $scope.investorPropertyId;
        $http({
            url : "UpdateInvestorProperty",
            method : "POST",
            data: $scope.financialDetails
        }).success(function(data) {
            if (data.status_code == '200' || data.status_code == 200) {
                jQuery.pnotify({
                  text: data.data.Reason,
                  type: 'success'
                });
                window.location.href = "/dashboard.html#/oneStepRegistration"
            } else {
                jQuery.pnotify({
                  text: data.data.Reason,
                  type: 'error'
                });
            }
        });
    }
}
])

dashboardApp.controller('formController', ['$scope', '$http','sharedProperties',

function ($scope, $http, sharedProperties) {
    if(sharedProperties.getProperty('userstatus') == 'unverified') {
        jQuery.pnotify({
          text: "User not verified",
          type: 'error'
        });
        window.location.href = "/dashboard.html#/RegistrationPending";
        return false;
    }
    $scope.dataToSend = {};
    $scope.requestLocation = '';
    $scope.successLocation = '';
    $scope.failureLocation = '';
    $scope.signUpData = {};
    $scope.formData = {};
    $scope.nameLengthShort = "Should be more than 3 characters";
    $scope.nameLengthLong = "Should not be more than 255 characters";
    $scope.nameCharacters = "Should contain only characters";
    $scope.emailInvalid = "Not a valid email";
    $scope.emailLengthLong = "Email should not be more than 255 characters";
    $scope.confirmEmail = "Emails are different";
    $scope.passwordLengthShort = "Password should be more than 4 characters";
    $scope.passwordLengthLong = "Password should not be more than 30 characters";
    $scope.setPassword = "Password should contain atleast 5 characters";
    $scope.confirmPassword = "Passwords are different";
    $scope.onlyNumbers = "Should contain numbers only";
    $scope.invalidDate = "Enter valid Date";
    $scope.invalidLink = "Enter valid Link";
    $scope.addLink = {};
    $scope.addLink.isUrl = 0;
    $scope.addpropertyResponse = {};
    $scope.displayloandetailsContainer = false;
    $scope.displaySearchPropertyContainer = true;
    $scope.addSearchAddPropertyData = {
        "is_link" : false,
        "link_to_property" :"",
        "house_price" : "",
        "deposit_amount" : "",
        "intended_property_usage" :"",
        "is_renovate" : "",
        "expect_refinance_years": "",
        "tenure" : "",
        "address" :  {
            "street_no": "",
            "street_name": "",
            "suburb": "",
            "landmarks": "",
            "other": "",
            "postcode": "",
            "city_name": "",
            "state_name": "",
            "country_name": ""
        },
        "agent_info" : {
            "first_name": "",
            "surname": "",
            "agent_email_id": ""
        },
        "phones" : {
            "work" : {
                "code" : "",
                "phone_number" : ""
            },
            "mobile" : {
                "code" : "",
                "phone_number" : ""
            }
        }
    }

    $scope.loandetailsContainershow = function() {
        $scope.displayloandetailsContainer = true;
        // $scope.displaySearchPropertyContainer = false;
        // $scope.addSearchAddPropertyData.is_link = true;
    };
    $scope.loandetailsContainerhide = function() {
        $scope.displayloandetailsContainer = false;
        // $scope.displaySearchPropertyContainer = true;
        // $scope.addSearchAddPropertyData.is_link = false;
    }
    $scope.processForm = function (formName, formFieldsData, requestURL, successURL, failureURL) {
     
        if (!$scope['searchAddProperties'].$valid) {
            console.log('invalid form');
                jQuery.pnotify({
                  text: "Invalid form",
                  type: 'error'
                });
            return;
        } else {
            console.log('form is valid');
        }
        // console.log($scope[formFieldsData]);
        jQuery('#overlay').removeClass('hide');
        $http({
            method: 'POST',
            url: '/property/basicdetails',
            data: $scope.addSearchAddPropertyData// pass in data as strings
        }).success(function (data) {
            jQuery('#overlay').addClass('hide');  
            if (data.status_code == '200' || data.status_code == 200) {
                var passingUrl = "You have added the property sucessfully. We will verify the property and notify you by email when it is ready for Auction.";
                jQuery.pnotify({
                  text: passingUrl,
                  type: 'success'
                });
                window.location.href = "/dashboard.html#/RegistrationPending";
            } else {
                $scope.addpropertyResponse = data.data.Reason;
                jQuery.pnotify({
                  text: $scope.addpropertyResponse,
                  type: 'error'
                });
            }
        });
    };
}]);

dashboardApp.controller('myBids',['$scope', '$http', 
    function ($scope, $http) {
        $scope.myBidsData = {};
        $http({
            method: 'GET',
            url: 'getBids',
        }).success(function (data) {
            $scope.myBidsData = data.data;
            console.log(data);
        });   

        $scope.completeDetails = function(id) {
            window.location.href = "propertyProfilePage.html#" + id;
        }
    }
]);

dashboardApp.controller('registrationPending', ['$scope', '$http', '$upload',

function ($scope, $http, $upload) {

    console.log($scope.$parent.test);

    $scope.nameLengthShort = "Should be more than 3 characters";
    $scope.nameLengthLong = "Should not be more than 255 characters";
    $scope.nameCharacters = "Should contain only characters";
    $scope.emailInvalid = "Not a valid email";
    $scope.emailLengthLong = "Email should not be more than 255 characters";
    $scope.confirmEmail = "Emails are different";
    $scope.passwordLengthShort = "Password should be more than 4 characters";
    $scope.passwordLengthLong = "Password should not be more than 30 characters";
    $scope.setPassword = "Password should contain atleast 5 characters";
    $scope.confirmPassword = "Passwords are different";
    $scope.onlyNumbers = "Numbers only";
    $scope.invalidDate = "Enter valid Date";
    $scope.invalidLink = "Enter valid Link";
    $scope.loanMessage = "";
    $scope.personalMessage = "";
    $scope.employmentMessage = "";
    $scope.accountData = {};
    $scope.borrowerDashboardDetails = {};
    $scope.countryCode = '';
    $scope.displayborrower2 = false;
    $scope.username = '';
    $scope.loginEmail = $scope.$parent.dashboardData.email;
    $scope.previous_employment1_no = 0;
    $scope.messagesIsEmpty = true;
    $scope.profile_status = 'personal';
    $scope.no_of_applicants = 1;
    jQuery('#userEmailId').val(jQuery('#userEmailFromRequest').val());

    $scope.personalDetails = {
            "title": "Mr",
            "first_name": "",
            "middle_name": "",
            "last_name": "",
            "dob": "",
            "address": {
                "street_no": "",
                "street_name": "",
                "suburb": "",
                "postcode": "",
                "city_name": "",
                "state_name": ""
            },
            "phone": {
                "work": {
                    "phone_city_code": "",
                    "phone_number": ""
                },
                "home": {
                    "phone_city_code": "",
                    "phone_number": ""
                },
                "mobile": {
                    "phone_city_code": "",
                    "phone_number": ""
                }
            },
            "idproof": [{
                "id_proof_id": "",
                    "id_proof_number": "",
                    "file": ""
                }, {
                "id_proof_id": "",
                    "id_proof_number": "",
                    "file": ""
                }],
            "image": ""
        };

        $scope.loanDetailsData = {
            "resume_headline" : "",
            "job_category": "",
            "skill_sets": "",
            "preferred_location": "",
            "is_relocate": "1",
            "total_experience": "0",
            "comments" : "",
            "current_employment": {
                "yearly_salary": "",
                "basis_of_employment": "",
                "profession": "",
                "industry": "",
                "employment_period_years": "",
                "employment_period_months": "",
                "functional_area" : "",
                "employment_role" : "",
            },
            "previous_employments": [

            ]
        };

        $scope.regFinancialData = {
            "class_10_details": {
                "year_of_passing" : "",
                "school_name" : "",
                "passing_percentage" : "",
                "basis_of_education" : "class_10"
            },
            "class_12_details" : {
                "year_of_passing" : "",
                "school_name" : "",
                "passing_percentage" : "",
                "basis_of_education" : "class_12"
            },
            "b_degree_details": {
              "year_of_passing" : "",
              "school_name" : "",
              "passing_percentage" : "",
              "basis_of_education" : "b_degree"    
            },
            "project_details" : {
                "project_name" : "",
                "project_description" : "",
                "project_link    " : ""
            },
            "more_projects" : [

            ]
        };

    $http({
        method: 'GET',
        url : "dashboardDetails"
    }).success(function(data) {
        console.log(data);
        $scope.borrowerDashboardDetails = data.data;
        if(!(jQuery.isEmptyObject($scope.borrowerDashboardDetails.inbox_message))){
           $scope.messagesIsEmpty = false;
        }
    });

    // $scope.personalDetails = {};
    // $scope.regEmploymentData = {};
//    $scope.regFinancialData = {};
    $scope.registrationResponse = '';
    $scope.filesList =  [];
    $scope.loanDetailsData.files_reference = {}
    $scope.onFileSelect = function($files,$event) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            file = $files[i];
        }
        var key = $event.currentTarget.name
        $scope.loanDetailsData.files_reference[key] = $event.currentTarget.value;
        $scope.filesList.push(file);
    }

    

    
    $scope.previousStep = function () {
         var activeTab = $('#registrationPendingFormTabs > .active');
        activeTab.removeClass('active');
        activeTab.prev('li').addClass('active');

        var activeContentTab = $('#registrationPendingFormContent > .active');
        activeContentTab.removeClass('active in');
        activeContentTab.prev('.tab-pane').addClass('active in');
    }

    $scope.loanDetails = function () {
        if(!$scope['loanDetailForm'].$valid) {
            console.log('invalid form');
            return;
            jQuery.pnotify({
                text: "Invalid Form",
                type: "error"
            })
        } else {
            console.log('form is valid');
        }
        jQuery('#overlay').removeClass('hide');
        console.log($scope.loanDetailsData);
        $scope.upload = $upload.upload({
            method: 'POST',
            url: 'regJobDetails',
            data: $scope.loanDetailsData,
            file: $scope.filesList, // pass in data as strings
        }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));    
        }).success(function (data) {
            jQuery('#overlay').addClass('hide');
            if (data.status_code == 200 || data.status_code == '200') {
                $scope.loanMessage = "Successfully entered Job details.";
                $('.nav-tabs > .active').next('li').find('a').trigger('click');
                jQuery.pnotify({
                  text: $scope.loanMessage,
                  type: 'success'
                });
                var activeTab = $('#registrationPendingFormTabs > .active');
                activeTab.removeClass('active');
                activeTab.next('li').addClass('active');

                var activeContentTab = $('#registrationPendingFormContent > .active');
                activeContentTab.removeClass('active in');
                activeContentTab.next('.tab-pane').addClass('active in');
            } else {
                $scope.loanMessage = data.data.Reason;
                jQuery.pnotify({
                  text: $scope.loanMessage,
                  type: 'error'
                });
            }
            console.log(data);
        });
    }
    
    $scope.addEmployment = function() {
        var newEmploymentObject = {
            "yearly_salary": "",
            "basis_of_employment": "",
            "profession": "",
            "industry": "",
            "employment_period_years": "",
            "employment_period_months": ""
        }
         $scope.loanDetailsData.previous_employments.push(newEmploymentObject);
    }

    $scope.removeEmployment = function(index) {

        $scope.loanDetailsData.previous_employments.splice(index,1);
    }

    $scope.personalDetailsSubmit = function () {
        if(!$scope['personalDetailsForm'].$valid) {
            jQuery.pnotify({
              text: 'Invalid Form',
              type: 'error'
            });
            return;
        } else {
            console.log('form is valid');
        }
        jQuery('#overlay').removeClass('hide');
        $scope.upload = $upload.upload({
            url: 'regPersonalDetails',
            method: 'POST',
            data: $scope.personalDetails,
            file: $scope.filesList,
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        jQuery('#overlay').addClass('hide');
        if (data.status_code == 200 || data.status_code == '200') {
            $scope.personalMessage = "Successfully entered Personal details.";
            jQuery.pnotify({
              text: $scope.personalMessage,
              type: 'success'
            });
            var activeTab = $('#registrationPendingFormTabs > .active');
            activeTab.removeClass('active');
            activeTab.next('li').addClass('active');

            var activeContentTab = $('#registrationPendingFormContent > .active');
            activeContentTab.removeClass('active in');
            activeContentTab.next('.tab-pane').addClass('active in');
        } else {
            $scope.personalMessage = data.data.Reason;
            jQuery.pnotify({
              text: $scope.personalMessage,
              type: 'error'
            });
        }
      });
    }


    $scope.add_more_projects = function() {
        
        var new_project_object = {
            "project_name" : "",
            "project_description" : "",
            "project_link" : ""
        }
        
        $scope.regFinancialData.more_projects.push(new_project_object);
    }

    $scope.removeProjects = function(index) {
            $scope.regFinancialData.more_projects.splice(index,1);
    }
    
    $scope.financialDetails = function () {
        console.log($scope.regFinancialData);
        console.log($scope['financialForm']);
        if(!$scope['financialForm'].$valid) {
            jQuery.pnotify({
              text: 'Missing values',
              type: 'error'
          });
            return;
        } else {
            console.log('form is valid');
        }
        jQuery('#overlay').removeClass('hide');
        console.log($scope.regFinancialData);
        $http({
            method: 'POST',
            url: 'extraDetails',
            data: $scope.regFinancialData // pass in data as strings
        }).success(function (data) {
            jQuery('#overlay').addClass('hide');
            if (data.status_code == 200 || data.status_code == '200') {
                $scope.registrationResponse = "Registration is Completed.";
                jQuery.pnotify({
                  text: $scope.registrationResponse,
                  type: 'success'
              });
                window.location.reload();
            } else {
                $scope.personalMessage = data.data.Reason;
                jQuery.pnotify({
                  text: $scope.personalMessage,
                  type: 'error'
              });
            }
        });
    }

    // $scope.extraDetails = function () {
    //     console.log($scope.extraDetails);
    //      if(!$scope['extraDetailsForm'].$valid) {
    //         jQuery.pnotify({
    //           text: 'Invalid Form',
    //           type: 'error'
    //         });
    //         return;
    //     } else {
    //         console.log('form is valid');
    //     }
    //     jQuery('#overlay').removeClass('hide');
    //     console.log($scope.extraDetails);
    //     $http({
    //         method: 'POST',
    //         url: 'extraDetails',
    //         data: $scope.extraDetails // pass in data as strings
    //     }).success(function (data) {
    //         jQuery('#overlay').addClass('hide');
    //         if (data.status_code == 200 || data.status_code == '200') {
    //             $scope.registrationResponse = "Registration is Completed.";
    //             jQuery.pnotify({
    //               text: $scope.registrationResponse,
    //               type: 'success'
    //             });
    //            window.location.reload();
    //         } else {
    //             $scope.personalMessage = data.data.Reason;
    //             jQuery.pnotify({
    //               text: $scope.personalMessage,
    //               type: 'error'
    //             });
    //         }
    //     });
    // }

    $scope.$on('getBorrwerDetails', function(e) {  
        var userId = jQuery('#userId').val();
        $http({
            method : "GET",
            url : "myAccountDetails?user_id="+userId
        }).success(function(data) {
            // jQuery('.usersListContainer').addClass('hide');
            // jQuery('.userDetails').removeClass('hide');
            // console.log(data);
            if(data.data.user_type == 'borrower') {
                var personalObject = data.data.personal
                if(data.data.no_of_applicants == 2){
                    $scope.displayborrower2 = true;
                }
                jQuery('.borrowerUserDetails').removeClass('hide');
                $scope.profile_status = data.data.profile_status;
                $scope.personalDetails.borrower1 = data.data.personal.borrower1;
                $scope.personalDetails.borrower2 = data.data.personal.borrower2;
                $scope.loanDetailsData = data.data.loan;
                $scope.no_of_applicants = data.data.no_of_applicants
            } else {
                jQuery('.investorUserDetails').removeClass('hide');
                $scope.investorDetails = data.data.oneStepRegistration;
            }
        });          
    });
}]);


dashboardApp.controller('yourProperties', ['$scope', '$http', 'sharedProperties',

    function ($scope, $http, sharedProperties) {
        if(sharedProperties.getProperty('userstatus') == 'unverified') {
            jQuery.pnotify({
              text: "User not verified",
              type: 'error'
            });
            window.location.href = "/dashboard.html#/RegistrationPending";
            return false;
        }
        $scope.dataToSend = {};
        $scope.propertyData = {};
        jQuery('#overlay').removeClass('hide');
        $http({
            method: 'GET',
            url: 'getProperties',
            //data    : $scope.totalData  // pass in data as strings
        }).success(function (data) {
            jQuery('#overlay').addClass('hide');
            // $scope.serverResponse = data.status_message;
            // $scope.statusCode = data.status_code;
            console.log('address', data);
            //console.log('address',data.address_id);
            $scope.propertyData = data.data;
        });


        $scope.completeDetails = function (is_auction, is_bidding_accepted, is_verified, id) {
            window.location.href = "propertyProfilePage.html#" + id;
        }
    }
]);


dashboardApp.controller('searchAddProperties', function ($scope, $http) {


});

dashboardApp.controller('dashboardController', function ($scope, $http,sharedProperties) {
    

    //$scope.registrationLink = '#/RegistrationPending';
    $scope.registrationLink = '#/oneStepRegistration';
    $scope.dashboardData = {};
    $scope.test = "sdsds";
    $scope.dashboardData.user_details = {};
    $scope.dashboardData.user_details.basic = {};
    $scope.notificationData = {};
    jQuery('#overlay').removeClass('hide');
    $http({
        'method' : 'GET',
        'url' : 'notification/viewAll'
    }).success(function(data) {
         $scope.notificationData = data.data;
         if (data.status_code == 200 || data.status_code == '200') {
                $scope.notificationData = data.data;
            } else {
                $scope.isError = true;
                $scope.displayError = data.data.Reason;
                jQuery.pnotify({
                  text: $scope.displayError,
                  type: 'error'
                });
            }
    });

$scope.get = function(){
        $scope.$broadcast ('someEvent');
        return  $scope.msg;        
    }

    $http({
        method: 'GET',
        url: '/getUserBasicDetails'
    }).success(function (data) {
        jQuery('#overlay').addClass('hide');
        $scope.dashboardData = data.data;
        $scope.check_verified = $scope.dashboardData.status;
        if (data.status_code == 401 || data.status_code == '401') {
            jQuery.pnotify({
                text: data.data.Reason,
                type: "error"
            });
            setTimeout(function(){window.location.href = "/index.html";},2000);
        } else {
            if($scope.dashboardData.is_employee == true) {
                $scope.dashboardUrl = "#RegistrationPending";
                sharedProperties.setProperty('usertype','borrower');
                sharedProperties.setProperty('userstatus',$scope.dashboardData.status)
                if($scope.dashboardData.status == 'unverified') {
                    window.location.href = "/dashboard.html#/RegistrationPending";
                }
            } else {
                $scope.dashboardUrl = "#oneStepRegistration";
                sharedProperties.setProperty('usertype','investor');
            }
            console.log($scope.dashboardData.email);
            jQuery('#userEmailFromRequest').val($scope.dashboardData.email);
            jQuery('#userEmailId').val($scope.dashboardData.email);
            jQuery('#userId').val($scope.dashboardData.id);
            $scope.$broadcast ('getBorrwerDetails');
        }
    });

    $scope.logout = function() {
        $http({
            method: 'GET',
            url: '/logout'
        }).success(function(data){
            if (data.status_code == 200 || data.status_code == '200') {
                window.location.href = "/index.html";
            } else {
                $scope.isError = true;
                $scope.displayError = data.data.Reason;
            }
        });
    }
});

dashboardApp.controller('oneStepRegistration', function ($scope, $http,$upload) {
    $scope.nameLengthShort = "Should be more than 3 characters";
    $scope.nameLengthLong = "Should not be more than 255 characters";
    $scope.nameCharacters = "Should contain only characters";
    $scope.emailInvalid = "Not a valid email";
    $scope.emailLengthLong = "Email should not be more than 255 characters";
    $scope.confirmEmail = "Emails are different";
    $scope.passwordLengthShort = "Password should be more than 4 characters";
    $scope.passwordLengthLong = "Password should not be more than 30 characters";
    $scope.setPassword = "Password should contain atleast 5 characters";
    $scope.confirmPassword = "Passwords are different";
    $scope.onlyNumbers = "Should contain numbers only";
    $scope.invalidDate = "Enter valid Date";
    $scope.invalidLink = "Enter valid Link";
    $scope.investorDashboardDetails = {};
    $scope.messagesIsEmpty = true;

    $http({
        method: 'GET',
        url : "dashboardDetails"
    }).success(function(data) {
        console.log(data);
        $scope.investorDashboardDetails = data.data;
        if(!(jQuery.isEmptyObject($scope.investorDashboardDetails.inbox_message))){
           $scope.messagesIsEmpty = false;
        }
    });

    $scope.oneStepRegistration = {
        "title": "",
        "first_name": "",
        "middle_name": "",
        "last_name": "",
        "email" : "",
        "dob": "",
        "address": {
            "country_name": "",
            "state_name": "",
            "city_name": "",
            "postcode": "",
            "suburb": "",
            "street_name": "",
            "street_no": ""
        },
        "mobile": {
            "phone_city_code": "",
            "phone_number": ""
        },
        "image": "",
        "bankdetail": {
            "bank_name": "",
            "account_holder_name": "",
            "account_number": "",
            "branch_name": ""
        }
    };

    $scope.filesList =  [];
    $scope.oneStepRegistration.files_reference = {}
    $scope.onFileSelect = function($files,$event) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            file = $files[i];
        }
        var key = $event.currentTarget.name
        $scope.oneStepRegistration.files_reference[key] = $event.currentTarget.value;
        $scope.filesList.push(file);
    }

    $scope.submitRegistration = function () {
        if (!$scope['oneStepRegistrationForm'].$valid) {
            console.log('invalid form');
            jQuery.pnotify({
                text : "Missing information",
                type : "error"
            });
            return;
        } else {
            console.log('form is valid');
        }
        jQuery('#overlay').removeClass('hide');
        $scope.upload = $upload.upload({
            method: 'POST',
            url: 'regInvestorDetails',
            data: $scope.oneStepRegistration, // pass in data as strings
            file: $scope.filesList
        }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
            console.log(data);
            jQuery('#overlay').addClass('hide');
            if (data.status_code == 200 || data.status_code == '200') {
                window.location.href = "/currentAuctionsSignedIn.html";
            } else {
                $scope.isError = true;
                $scope.displayError = data.data.Reason;
                jQuery.pnotify({
                  text: $scope.displayError,
                  type: 'error'
                });
            }

        });
    }

});
dashboardApp.controller('addProperty', function ($scope, $http) {
    $scope.nameLengthShort = "Should be more than 3 characters";
    $scope.nameLengthLong = "Should not be more than 255 characters";
    $scope.nameCharacters = "Should contain only characters";
    $scope.emailInvalid = "Not a valid email";
    $scope.emailLengthLong = "Email should not be more than 255 characters";
    $scope.confirmEmail = "Emails are different";
    $scope.passwordLengthShort = "Password should be more than 4 characters";
    $scope.passwordLengthLong = "Password should not be more than 30 characters";
    $scope.setPassword = "Password should contain atleast 5 characters";
    $scope.confirmPassword = "Passwords are different";
    $scope.onlyNumbers = "Should contain numbers only";
    //$scope.invalidDate = "Enter valid Date";
    $scope.invalidLink = "Enter valid Link";
    $scope.totalData = {};
    $scope.property_in_detail = {
        "property_id": '',
            "proerty_type": "",
            "built_in_year": "",
            "num_floors": '',
            "num_beds": '',
            "num_bath_rooms": '',
            "parking_space": '',
            "sq_ft": '',
            "pricing": '',
            "living_space_items": "",
            "living_room_comments": "",
            "roof_comments": "",
            "pool_comments": "",
            "house_style_comments": "",
            "attic": "",
            "hot_water": "",
            "water_resource": "",
            "gas_source": "",
            "sanitation_source": "",
            "elementary_school": "",
            "middle_school": "",
            "listing_status": "",
            "listing_date": "",
            "status_date": "",
            "pool_comments": "",
            "short_description": "",
            "agent_contact_no": ""
    };
    $scope.addressData = {
        "street_no": "",
            "street_name": "",
            "suburb": "",
            "landmarks": "",
            "other": "",
            "postcode": "",
            "city_name": "",
            "state_name": "",
            "country_name": "",
            "address_type": ""
    };
    $scope.images = {};
    $scope.attachments = {};
    //$scope.addPropertyForm={};
    $scope.submitForm = function () {
        console.log($scope.totalData);
        console.log($scope);
        console.log($scope['addPropertyForm']);
        console.log($scope['addPropertyForm'].$valid);
        // $scope.$watch('$scope["addPropertyForm"].$valid', function(newVal) {           
        //         //$scope.valid = newVal;
        //         $console.log($scope['addPropertyForm']);
        //     });
        if (!$scope['addPropertyForm'].$valid) {
            console.log('invalid form');
            return;
        } else {
            console.log('form is valid');
            $scope.totalData.property_in_detail = $scope.property_in_detail;
            $scope.totalData.addressData = $scope.addressData;
            $scope.totalData.images = $scope.images;
            $scope.totalData.attachments = $scope.attachments;
            console.log($scope.totalData);
        }
        //$(location).attr('href',"auction_request_confirmation.html");
        $http({
            method: 'POST',
            url: 'property/indetails',
            data: $scope.totalData // pass in data as strings
        }).success(function (data) {
            $scope.serverResponse = data.status_message;
            $scope.statusCode = data.status_code;
            console.log('address', data);
            console.log('address', data.address_id);
        });
        // $http({
        //     method  : 'POST',
        //     url     : 'property/indetails',
        //     data    : $scope.addPropertyData  // pass in data as strings
        // }).success(function(data) {
        //        $scope.serverResponse = data.status_message;
        //        $scope.statusCode = data.status_code;
        //        console.log('property',data);
        //        console.log('property',data.address_id);
        //    });
    };
});
dashboardApp.directive('clickOnExpand',

function ($animate) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ngModelCtrl) {
            var allowedTypes = ['radio'];
            if (allowedTypes.indexOf(attr.type) === -1) {
                return;
            }
            elm.bind('click', function () {
                // var fieldName = attr.name;
                // var errorMessage = "";
                // var inputValue = elm.val();
                // var isOk = false;
                // var isEmpty = false;
                var inputFields = elm.parent().parent().parent().find('.input-fields');
                var inputWrapper = elm.parent().parent().parent();
                // console.log(inputFields);
                // console.log(inputFields.html());

                if (attr.clickExpand == 'yes') {
                    inputWrapper.css("background-color", "#f0f0f0");
                    inputFields.addClass("displayed");
                    inputFields.removeClass("notdisplayed");
                }
                if (attr.clickExpand == 'no') {
                    inputWrapper.css("background-color", "#ffffff");
                    inputFields.addClass("notdisplayed");
                    inputFields.removeClass("displayed");
                }
            });
        }
    };
});

dashboardApp.directive('validateOnBlur', function () {

    /**
    class="input-field"  ng-pattern="/^[a-zA-Z ]{1,30}$/" ng-update-model-on="blur"
    ng-pattern="/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/" 
     * After blur has occurred on a field, reapply change monitoring
     * @param scope
     * @param elm
     * @param attr
     * @param ngModelCtrl
     */
    var removeBlurMonitoring = function (scope, elm, attr, ngModelCtrl) {
        elm.unbind('blur');

        // Reapply regular monitoring for the field
        elm.bind('keydown input change blur', function () {
            scope.$apply(function () {
                ngModelCtrl.$setViewValue(elm.val());
            });
        });
    };

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ngModelCtrl) {
            var allowedTypes = ['text', 'email', 'password'];
            if (allowedTypes.indexOf(attr.type) === -1) {
                return;
            }

            // Unbind onchange event so that validation will be triggerd onblur
            elm.unbind('input').unbind('keydown').unbind('change');

            // Set OnBlur event listener
            elm.bind('blur', function () {
                //alert('hi');
                var fieldName = attr.name;
                // console.log(scope.signForm);
                // console.log(scope.signForm[attr.name]);
                // console.log(scope.signForm[attr.name].$valid);
                // console.log(scope.signForm[attr.name], scope.signForm[attr.name].$error.required, scope.signForm[attr.name].$error['required']);
                //scope.signForm[attr.name].$valid = false;
                //scope.signForm[attr.name].$setValidity(false);
                //scope.$apply();
                //scope.signForm[attr.name].$invalid = true;
                // scope.signForm[attr.name].$error.required = false;
                // scope.signForm[attr.name].$setValidity('required',false);
                //console.log(elm);
                //console.log(elm.$valid);
                // console.log(attr.formName);
                // console.log(scope[attr.formName]);
                var signForm = scope[attr.formName];

                //elm.removeClass('ng-invalid');
                //elm.addClass('ng-valid');
                // console.log(elm);
                //console.log(elm.$valid);
                var errorMessage = "";
                var inputValue = elm.val();
                var isOk = false;
                var isEmpty = false;
                // console.log(signForm);
                // console.log( signForm[attr.name]);
                //var formName = attr.formName
                //console.log(attr.validateType, inputValue.match(/^[a-zA-Z ]{1,30}$/))
                if (attr.validateType == 'name') {
                    if (inputValue.match(/^[a-zA-Z ]{1,30}$/g)) {
                        isOk = true;
                    } else {
                        errorMessage = scope.nameCharacters;
                        isOk = false;
                    }
                    // if (inputValue.length < 3) {
                    //     errorMessage = scope.nameLengthShort;
                    //     isOk = false;
                    // }
                    if (inputValue.length > 30) {
                        errorMessage = scope.nameLengthLong;
                        isOk = false;
                    }
                }
                if (attr.validateType == 'email') {
                    // if(inputValue.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
                    if (inputValue.match(/^[a-zA-Z0-9._]+@[a-zA-Z0-9-_]+?\.[a-zA-Z]{2,4}$/)) {
                        isOk = true;
                    } else {
                        errorMessage = scope.emailInvalid;
                        isOk = false;
                    }
                }
                if (attr.validateType == 'years') {
                    // if(inputValue.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
                    if (inputValue.match(/^[0-9]{1,2}$/)) {
                        isOk = true;
                    } else {
                        errorMessage = 'invalid year';
                        isOk = false;
                    }
                }
                if (attr.validateType == 'months') {
                    // if(inputValue.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
                    if (inputValue.match(/^[0-9]{1,2}$/) && (inputValue >= 1) && (inputValue <= 12)) {
                        isOk = true;
                    } else {
                        errorMessage = 'invalid month';
                        isOk = false;
                    }
                }
                if (attr.validateType == 'novalid') {
                    isOk = true;
                }
                if (attr.validateType == 'password') {
                    if (inputValue.length < 5) {
                        errorMessage = scope.passwordLengthShort;
                        isOk = false;
                    } else if (inputValue.length > 250) {
                        errorMessage = scope.passwordLengthLong;
                        isOk = false;
                    } else {
                        isOk = true;
                    }
                }
                if (attr.validateType == 'number') {
                    // if(inputValue.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
                    if (inputValue.match(/^[0-9]+$/)) {
                        isOk = true;
                    } else {
                        errorMessage = scope.onlyNumbers;
                        isOk = false;
                    }
                }
                if (attr.validateType == 'link') {
                    // if(inputValue.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
                    if (inputValue.match(/^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/)) {
                        isOk = true;
                    } else {
                        errorMessage = scope.invalidLink;
                        isOk = false;
                    }
                }
                if (attr.validateType == 'date') {
                    // if(inputValue.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
                    //if(inputValue.match(/^(((0[13578]|1[02])/(0[1-9]|[12]\d|3[01])/((19|[2-9]\d)\d{2}))|((0[13456789]|1[012])/(0[1-9]|[12]\d|30)/((19|[2-9]\d)\d{2}))|(02/(0[1-9]|1\d|2[0-8])/((19|[2-9]\d)\d{2}))|(02/29/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/)){
                    if (inputValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                        isOk = true;
                    } else {
                        errorMessage = scope.invalidDate;
                        isOk = false;
                    }
                }
                if (attr.validateType == 'same') {
                    var validateClass = "." + attr.validateType + attr.validateId;
                    //console.log(validateClass);
                    //console.log(angular.element(validateClass));
                    //console.log(angular.element(validateClass).val());
                    if (inputValue == angular.element(validateClass).val()) {
                        isOk = true;
                    } else {
                        isOk = false; //errorMessage = scope.confirmEmail;alert(attr.type);
                        if (attr.type == "text") {
                            errorMessage = scope.confirmEmail;
                        }
                        if (attr.type == "password") {
                            errorMessage = scope.confirmPassword;
                        }
                    }
                }
                // console.log(scope);
                // console.log(attr.validateType);
                // console.log(ngModelCtrl);
                //console.log(elm);
                if (inputValue.length == 0) {
                    isEmpty = true;
                }
               

                elm.parent().find('.validation-message').remove();
                elm.parent().find('p').remove();
                if (isOk == true) {

                    elm.parent().css("border-color", "#8fc146");
                    ngModelCtrl.$setValidity('valid', true);

                } else if (isOk == false) {

                    ngModelCtrl.$setValidity('valid', false);
                    elm.parent().css("border-color", "#e60020");
                    elm.parent().append("<p class='validation-message'>" + errorMessage + "<p>");
                   
                } 
                if (isEmpty == true) {
                    elm.parent().css("border-color","#000000");
                    elm.parent().find('.validation-message').remove();
                    console.log(elm.parent().find('p'));
                    elm.parent().find('p').remove();
                }
                 if (inputValue.length == 0) {
                    // var requiredAttr = elm.attr('required');
                    // // For some browsers, `attr` is undefined; for others,
                    // if (typeof requiredAttr == 'undefined' && requiredAttr == false) {
                        ngModelCtrl.$setValidity('valid', true);
                    // }
                }
            });
        }
    };
});
dashboardApp.service('sharedProperties', function () {
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

dashboardApp.directive('datepicker', function(){
  return    {
    restrict:'C',
    require : 'ngModel',
    link : function (scope, element, attrs, ngModelCtrl) {
      $(function(){
          element.datepicker({
              dateFormat:'mm/dd/yy',
              onSelect:function (date) {
                  ngModelCtrl.$setViewValue(date);
                  scope.$apply();
              }
          });
      });
    } 
  }
});


dashboardApp.controller('DemoFileUploadController', [
    '$scope', '$http', '$filter', '$window',
    function ($scope, $http, $filter, $window) {
        $scope.options = {
            url: url
        };
        if (!isOnGitHub) {
            $scope.loadingFiles = true;
            $http.get(url)
            .then(
                function (response) {
                    $scope.loadingFiles = false;
                    $scope.queue = response.data.files || [];
                },
                function () {
                    $scope.loadingFiles = false;
                }
                );
        }
    }
    ]);

dashboardApp.controller('FileDestroyController', [
'$scope', '$http',
function ($scope, $http) {
    var file = $scope.file,
    state;
    if (file.url) {
        file.$state = function () {
            return state;
        };
        file.$destroy = function () {
            alert("EEEEEEE");
            state = 'pending';
            return $http({
                url: file.deleteUrl,
                method: file.deleteType
            }).then(
            function () {
                state = 'resolved';
                $scope.clear(file);
            },
            function () {
                state = 'rejected';
            }
            );
        };
    } else if (!file.$cancel && !file._index) {
        file.$cancel = function () {
            $scope.clear(file);
        };
    }
}
]);
