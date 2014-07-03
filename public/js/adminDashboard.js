 // 'use strict';

var isOnGitHub = window.location.hostname === 'blueimp.github.io',
        url = isOnGitHub ? '//jquery-file-upload.appspot.com/' : 'js/jQuery-File-Upload/server/php/index.php';

var adminDashboardApp = angular.module('adminDashboardApp', ['ngRoute', 'angularFileUpload', 'blueimp.fileupload']);
adminDashboardApp.config(['$routeProvider','$httpProvider','fileUploadProvider',

    function ($routeProvider,$httpProvider,fileUploadProvider) {
        $routeProvider.
        when('/Users', {
            templateUrl: 'users.html',
            controller: 'users'
        }).
        when('/', {
            templateUrl: 'clickDashBoard.html',
            controller: 'defaultController'
        }).
        when('/Properties', {
            templateUrl: 'adminProperties.html',
            controller: 'properties'
        }).
        when('/Payments',{
            templateUrl: 'adminPayments.html',
            controller: 'payments'
        }).
        when('/adminMessageCenter',{
            templateUrl: 'adminMessageCenter.html',
            controller: 'messageCenter'
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

adminDashboardApp.controller('defaultController',function($scope,$http) {
   window.location.href = "/adminDashboard.html#/Users"
});


adminDashboardApp.controller('users',function($scope,$http) {
    $scope.filterData = {
        "username" : "",
        "user_status" : "",
        "user_type" : "",
        "created_at" : ""
    };

    $scope.verifyUserData = {
        "user_id" : "",
        "borrower_rating" : ""
    };

    $scope.personalDetails = {};
    $scope.personalDetails.borrower1 = {}; 
    $scope.personalDetails.borrower2 = {};
    $scope.personalDetails.loan = {};
    $scope.personalDetails.financial_details = {};
    $scope.personalDetails.financial_details.employment = {};
    $scope.personalDetails.financial_details.employment.borrower1 = {}
    $scope.personalDetails.financial_details.assets_liabilities = {};
    $scope.personalDetails.financial_details.assets_liabilities.assets = {};
    $scope.personalDetails.financial_details.assets_liabilities.liabilities = {};
    $scope.personalDetails.financial_details.employment = {};
    $scope.personalDetails.financial_details.monthly_expenses = {};
    $scope.personalDetails.financial_details.monthly_expenses.living_expenses = {};
    $scope.personalDetails.financial_details.monthly_expenses.financial_expenses = {};
    $scope.personalDetails.financial_details.monthly_expenses.assets_liabilities = {};
    $scope.personalDetails.financial_details.monthly_expenses.assets_liabilities.liabilities = {};
    $scope.personalDetails.financial_details.monthly_expenses.assets_liabilities.assets = {};
    $scope.investorDetails = {}
    $scope.displayBorrowwer2 = false;
    
    $scope.verifyUserId = 0;
    $scope.usersData = {};

    $scope.displayResultsView = false;

    $scope.searchUserCriteria = function() {
       jQuery('#overlay').removeClass('hide');
       $http({
         method : 'GET',
         url : 'admin/viewUserList?username='+$scope.filterData.username+
               '&user_status='+$scope.filterData.user_status+'&user_type='
                +$scope.filterData.user_type+'&created_date='+$scope.filterData.created_at
       }).success(function(data) {
            $scope.displayResultsView = true;
            $scope.usersData = data.data;
            jQuery('#overlay').addClass('hide');
       });
    };

    $scope.getUserDetails = function(userId){
        $http({
            method : "GET",
            url : "myAccount?user_id="+userId
        }).success(function(data) {
            jQuery('.usersListContainer').addClass('hide');
            jQuery('.userDetails').removeClass('hide');
            console.log(data);
            if(data.data.user_type == 'borrower') {
                var personalObject = data.data.personal
                if(personalObject.hasOwnProperty('borrower2')){
                    $scope.displayBorrowwer2 = true;
                }
                jQuery('.borrowerUserDetails').removeClass('hide');
                $scope.personalDetails.borrower1 = data.data.personal.borrower1;
                $scope.personalDetails.borrower2 = data.data.personal.borrower2;
                $scope.personalDetails.loan = data.data.loan;
                $scope.personalDetails.financial_details.monthly_expenses.living_expenses = data.data.financial_details.monthly_expenses.living_expenses;
                $scope.personalDetails.financial_details.monthly_expenses.financial_expenses = data.data.financial_details.monthly_expenses.financial_expenses;
                $scope.personalDetails.financial_details.employment.borrower1 = data.data.financial_details.employment.borrower1.current_employment;
                $scope.personalDetails.financial_details.assets_liabilities.assets = data.data.financial_details.assets_liabilities.assets;
                $scope.personalDetails.financial_details.assets_liabilities.liabilities = data.data.financial_details.assets_liabilities.liabilities;
            } else {
                jQuery('.investorUserDetails').removeClass('hide');
                $scope.investorDetails = data.data.oneStepRegistration;
            }
        });
    }

    $scope.mySplit = function(string) {
        $scope.array = string.split('_');
        return $scope.result = $scope.array.join(' ');
    }

    $scope.backToUsers = function() {
        jQuery('.usersListContainer').removeClass('hide');
        jQuery('.userDetails,.investorUserDetails,.borrowerUserDetails').addClass('hide');
    }

    $scope.verifyUser = function(verifyUserId) {
        $scope.verifyUserId = verifyUserId;
    };

    $scope.submitVerification = function() {
        $scope.verifyUserData.user_id = $scope.verifyUserId;
        $http({
            method : 'POST',
            url : 'admin/changeUserVerification',
            data: $scope.verifyUserData
        }).success(function(data) {
           if (data.status_code == 200 || data.status_code == '200') {
                jQuery.pnotify({
                    text: data.data.Reason,
                    type: "success"
                });
                jQuery('#verifyModal').modal('hide');
                $scope.searchUserCriteria();
            } else {
                jQuery.pnotify({
                    text: data.data.Reason,
                    type: "error"
                });
            }
        });
    }

});

adminDashboardApp.controller('payments',function($scope,$http) {
     $scope.searchPropertiesInput = {
        "street_address" : "",
        "suburb" : "",
        "state" : "",
        "property_price" : "",
        "country" : "",
        "status" : "",
        "property_type" : "",
        "property_created_date" : "",
        "username" : ""
    }

    $scope.paymentDetails = {
        "payment_installment_amount" : "",
        "payment_installment_date" : "",
        "no_of_months" : "",
        "property_id" : ""
    }

    $scope.referenceNoDetails = {
        "payment_reference_no" : "",
        "payment_date" : "",
        "payment_amount" : ""
    }

    $scope.propertiesData = {};
    $scope.diplayProperties = true;
    $scope.paymentPropertyId = '';

    $scope.searchPropertyCriteria = function() {
        jQuery('#overlay').removeClass('hide');
        $http({
            method : 'GET',
            url : 'admin/getPayProperties?username='+$scope.searchPropertiesInput.username+
               '&property_type='+$scope.searchPropertiesInput.property_type+'&street_address='
                +$scope.searchPropertiesInput.street_address+'&suburb='+$scope.searchPropertiesInput.suburb
                +'&state='+$scope.searchPropertiesInput.state+'&property_price='+$scope.searchPropertiesInput.property_price
                +'&country='+$scope.searchPropertiesInput.country
                +'&property_created_date='+$scope.searchPropertiesInput.property_created_date
        }).success(function(data) {
            $scope.displayResultsView = true;
            $scope.propertiesData = data.data;
            jQuery('#overlay').addClass('hide');
        });
    }

    $scope.updatePropertyId = function(propertyId) {
        $scope.paymentPropertyId = propertyId;
    }
    $scope.uploadPayment = function() {
        jQuery('#overlay').removeClass('hide');
        $scope.paymentDetails.property_id = $scope.paymentPropertyId;
        $http({
            method : 'POST',
            url : 'admin/uploadPaymentCalendar',
            data : $scope.paymentDetails
        }).success(function(data) {
                if (data.status_code == 200 || data.status_code == '200') {
                    jQuery.pnotify({
                        text: data.data.Reason,
                        type: "success"
                    });
                    jQuery('.modal').modal('hide')
                    jQuery('#overlay').addClass('hide');
                    $scope.searchPropertyCriteria();
                } else {
                    jQuery.pnotify({
                        text: data.data.Reason,
                        type: "error"
                    });
                }
        });
    }

    $scope.submitReferenceNo = function() {
        jQuery('#overlay').removeClass('hide');
        $http({
            method : 'POST',
            url : 'admin/markPayment',
            data : $scope.referenceNoDetails
        }).success(function(data) {
            if (data.status_code == 200 || data.status_code == '200') {
                    jQuery.pnotify({
                        text: data.data.Reason,
                        type: "success"
                    });
                    $scope.referenceNoDetails = {
                        "payment_reference_no" : "",
                        "payment_date" : "",
                        "payment_amount" : ""
                    }
                    jQuery('#overlay').addClass('hide');
                } else {
                    jQuery.pnotify({
                        text: data.data.Reason,
                        type: "error"
                    });
                }
        });
    }
});


adminDashboardApp.controller('properties',['$scope','$http', '$upload',
function ($scope,$http,$upload) {

    $scope.searchPropertiesInput = {
        "street_address" : "",
        "suburb" : "",
        "state" : "",
        "property_price" : "",
        "country" : "",
        "status" : "",
        "property_type" : "",
        "property_created_date" : "",
        "username" : ""
    }


    $scope.fullDetails = {
        "property_id" : "",
        "is_link" : false,
        "property_info" : "",
        "link_to_property" :"",
        "house_price" : "",
        "deposit_amount" : "",
        "intended_property_usage" :"",
        "is_renovate" : "",
        "expect_refinance_years": "",
        "tenure" : "",
        "built_in_year" : "",
        "no_of_floors" : "",
        "no_of_beds" : "",
        "no_of_bathrooms" : "",
        "parking" : "",
        "land_size" : "",
        "short_description" : "",
        "floor_plan" :"",
        "local_info" :"",
        "area_value" :"",
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
            "agency_name": "",
            "agent_name": "",
            "agent_logo": "",
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

    $scope.propertiesData = {};

    $scope.diplayProperties = true;

    $scope.getPropertyDetails = function(propertid) {
        window.location.href = "propertyProfilePage.html#" + propertid;
    }

    $scope.searchPropertyCriteria = function() {
        jQuery('#overlay').removeClass('hide');
        $http({
            method : 'GET',
            url : '/admin/viewPropertyList?username='+$scope.searchPropertiesInput.username+
               '&property_type='+$scope.searchPropertiesInput.property_type+'&street_address='
                +$scope.searchPropertiesInput.street_address+'&suburb='+$scope.searchPropertiesInput.suburb
                +'&state='+$scope.searchPropertiesInput.state+'&property_price='+$scope.searchPropertiesInput.property_price
                +'&country='+$scope.searchPropertiesInput.country
                +'&status='+$scope.searchPropertiesInput.status
                +'&property_created_date='+$scope.searchPropertiesInput.property_created_date
        }).success(function(data) {
            $scope.displayResultsView = true;
            $scope.propertiesData = data.data;
            jQuery('#overlay').addClass('hide');
        });
    }

    $scope.verifyProperty = function(propertyId) {
         jQuery('#overlay').removeClass('hide');
         $http({
             method : 'GET',
             url : '/admin/editPropertyDetails?property_id='+propertyId
         }).success(function(data) {
            $scope.diplayProperties = false;
             $scope.fullDetails = data.data;
             $scope.fullDetails.property_id = propertyId;
             jQuery('#overlay').addClass('hide');
         })
    }

    $scope.backToProperties = function() {
        $scope.diplayProperties = true;
        setTimeout(function() {
            jQuery('.cancel').trigger('click');
        },1000);
    }

    $scope.addProperty = function(queue) {
        console.log($scope.fullDetails);
        console.log(queue)
        jQuery('#overlay').removeClass('hide');
        $scope.upload = $upload.upload({
            method : 'POST',
            url : 'admin/updatePropertyDetails',
            data : $scope.fullDetails,
            file : queue
        }).success(function(data) {
           if (data.status_code == 200 || data.status_code == '200') {
                jQuery.pnotify({
                    text: data.data.Reason,
                    type: "success"
                });
            }else {
                jQuery.pnotify({
                    text: data.data.Reason,
                    type: "error"
                });
            }
            jQuery('#overlay').addClass('hide');
            setTimeout(function() {
                jQuery('.cancel').trigger('click');
            },1000);
            $scope.verifyProperty($scope.fullDetails.property_id);
        });

    }

    
}]);


adminDashboardApp.controller('adminDashboardController', function ($scope, $http) {

    // return false;
    $scope.dashboardData = {};
    $scope.notificationData = {};
    jQuery('#overlay').removeClass('hide');

    $http({
        'method' : 'GET',
        'url' : 'notification/viewAll'
    }).success(function(data) {
        $scope.notificationData = data.data;

        if(data.status_code == 200 || data.status_code == '200') {
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

adminDashboardApp.controller('messageCenter',['$scope','$http', '$upload',
function ($scope,$http,$upload) {

    $scope.filesList =  [];

    $scope.replyMessageData = {
        "content" : "",
        "subject" : "",
        "parent_message_id" : "",
        "userid" : ""
    }
    $scope.inboxMessages = {};
    $scope.sentItemsData = {};

    $scope.messageData = {
        "content" : "",
        "subject" : "",
        "parent_message_id" : "",
        "userid" : ""
    }

    $scope.archiveItemsData = {
        "parent_message_id" : ""
    }

    $scope.usersList = {}
    $scope.selectedUserId = '';
    $scope.selectedUserName = '';

    $http({
        method: 'GET',
        url : 'admin/userList'
    }).success(function(data){
        $scope.usersList = data.data;
        $scope.selectedUserId = 1;
        $scope.selectedUserName = $scope.usersList[$scope.selectedUserId];

        $scope.messageData.userid = $scope.selectedUserId;
        $scope.loadUserMessages();
        console.log($scope.usersList)
    });

    $scope.loadUserMessages = function() {
        var userId = $scope.selectedUserId;
        $scope.selectedUserName = $scope.usersList[$scope.selectedUserId];
        $scope.retrieveInbox(userId);
        $scope.replyMessageData.userid = $scope.selectedUserId;
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

    
    $scope.retrieveInbox = function(userId) {
        if(typeof(userId) == 'undefined') {
            var userId = $scope.selectedUserId;
        }
        jQuery('.archiveImg').addClass('hide');
        $scope.deleteElementsId = [];
        $scope.iMessageClose();
        jQuery('#overlay').removeClass('hide'); 
        $http({
            method: 'GET',
            url : 'admin/inbox?userId='+userId
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

    
    $scope.retrieveSentItems = function(userId) {
         if(typeof(userId) == 'undefined') {
            var userId = $scope.selectedUserId;
        }
        $scope.deleteElementsId = [];
        $scope.iMessageClose();
        $http({
            method: 'GET',
            url : 'admin/sent?userid='+userId
        }).success(function(data) {
            $scope.sentItemsData = data.data;
        });
    } 

    $scope.trashItemsData = {};
    $scope.retrieveTrashItems = function(userId) {
        if(typeof(userId) == 'undefined') {
            var userId = $scope.selectedUserId;
        }
        $scope.deleteElementsId = [];
        $scope.iMessageClose();
        $http({
            method: 'GET',
            url : 'admin/trash?userid='+userId
        }).success(function(data) {
            $scope.trashItemsData = data.data;
        });
    } 

  //  $scope.retrieveInbox();


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

adminDashboardApp.directive('datepicker', function(){
  return    {
    restrict:'C',
    require : 'ngModel',
    link : function (scope, element, attrs, ngModelCtrl) {
      $(function(){
          element.datepicker({
              dateFormat:'dd-mm-yy',
              onSelect:function (date) {
                  ngModelCtrl.$setViewValue(date);
                  scope.$apply();
              }
          });
      });
    } 
  }
});

 adminDashboardApp.controller('DemoFileUploadController', [
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

    adminDashboardApp.controller('FileDestroyController', [
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
