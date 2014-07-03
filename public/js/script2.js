//alert($(location).attr('href'));

// $('#btnReview').click(function(){
//   $('.nav-tabs > .active').next('li').find('a').trigger('click');
// });
// <a class="btn btn-primary" href="#" id="btnReview">Review</a>
var dashboardApp = angular.module('dashboardApp', []);   
dashboardApp.controller = dashboardApp.controller('formController',['$scope', '$http',
function ($scope, $http) {
    $scope.formData = {};
    $scope.nameLengthShort = "Name should be more than 3 characters";
    $scope.nameLengthLong = "Name should not be more than 255 characters";
    $scope.nameCharacters = "Name should contain only characters";
    $scope.emailInvalid = "Not a valid email";
    $scope.emailLengthLong = "Email should not be more than 255 characters";
    $scope.confirmEmail = "Emails are different";
    $scope.passwordLengthShort = "Password should be more than 4 characters";
    $scope.passwordLengthLong = "Password should not be more than 30 characters";
    $scope.setPassword = "Password should contain atleast 5 characters";
    $scope.confirmPassword = "Passwords are different";
    
    $scope.processForm = function(formName,formFieldsData ) {
        console.log($scope[formName]);
        console.log($scope[formName].$valid);
        if(!$scope[formName].$valid) {
            console.log('invalid form');
            return;
        }    
        // $scope.formData.user_type = 'borrower';
        // $scope.formData.title = angular.element('#user-title').val();
        // $scope.formData.first_name = "Shruti";
        // $scope.formData.middle_name = ""  ;
        // $scope.formData.last_name = "Madan" ;
        // $scope.formData.email = 'shrutim@langoor.com';
        // $scope.formData.email_confirmation =  'shrutim@langoor.com';
        // $scope.formData.password =  '123456';
        // $scope.formData.password_confirmation =  '123456 ';

        $scope.formData.user_type = userType;
        $scope.formData.title = angular.element('#user-title').val();
        $scope.formData.first_name = angular.element('#fullname').val();
        $scope.formData.middle_name = ""  ;
        $scope.formData.last_name = "" ;
        $scope.formData.email = angular.element('#emailAddress').val();
        $scope.formData.email_confirmation =  angular.element('#emailAddresss').val();
        $scope.formData.password =  angular.element('#passwordFirst').val();
        $scope.formData.password_confirmation =  angular.element('#passwordConfirm').val();

        console.log($scope[formFieldsData]);
        //$(location).attr('href',"auction_request_confirmation.html");
        $http({
            method  : 'POST',
            url     : '/register',
            data    : $scope[formFieldsData],  // pass in data as strings
        }).success(function(data) {
               $scope.serverResponse = data.status_message;
               $scope.statusCode = data.status_code;
               console.log(data);
               var urlRedirect = "auction_request_confirmation.html#"+data.status_code;
               alert("worked");
               //$(location).attr('href',"auction_request_confirmation.html");
               if (!data.success) {
                  // if not successful, bind errors to error variables
                  $scope.serverResponse = data.status_message;
                   $scope.errorName = data.errors.name;
                   $scope.errorSuperhero = data.errors.superheroAlias;
               } else {
                  // if successful, bind success message to message
                   $scope.message = data.message;
               }
           });
   };















}]); 
dashboardApp.directive('validateOnBlur', function() {
 
    /**

    class="input-field"  ng-pattern="/^[a-zA-Z ]{1,30}$/" ng-update-model-on="blur"
    ng-pattern="/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/" 
     * After blur has occurred on a field, reapply change monitoring
     * @param scope
     * @param elm
     * @param attr
     * @param ngModelCtrl
     */
    var removeBlurMonitoring = function(scope, elm, attr, ngModelCtrl) {
        elm.unbind('blur');

        // Reapply regular monitoring for the field
        elm.bind('keydown input change blur', function() {
            scope.$apply(function() {
                ngModelCtrl.$setViewValue(elm.val());
            });
        });
    };

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attr, ngModelCtrl) {
            var allowedTypes = ['text', 'email', 'password'];
            if (allowedTypes.indexOf(attr.type)  === -1) {
                return;
            }

            // Unbind onchange event so that validation will be triggerd onblur
            elm.unbind('input').unbind('keydown').unbind('change');
            
            // Set OnBlur event listener
            elm.bind('blur', function() {
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
                console.log(attr.name);
                //console.log(elm);
                //console.log(elm.$valid);


                //elm.removeClass('ng-invalid');
                //elm.addClass('ng-valid');
                // console.log(elm);
                //console.log(elm.$valid);
                var errorMessage = "";
                var inputValue = elm.val();
                var isOk = false;
                var isEmpty = false;
                //var 
                //console.log(attr.validateType, inputValue.match(/^[a-zA-Z ]{1,30}$/))
                if(attr.validateType == 'name'){
                    if(inputValue.match(/^[a-zA-Z ]{1,30}$/g)){
                        isOk = true;
                    }else{
                        errorMessage = scope.nameCharacters;
                        isOk = false;
                    }
                    if(inputValue.length < 3){
                        errorMessage = scope.nameLengthShort;
                        isOk = false;
                    }
                    if(inputValue.length > 30){
                        errorMessage = scope.nameLengthLong;
                        isOk = false;
                    }                    
                }
                if(attr.validateType == 'email'){
                   // if(inputValue.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
                    if(inputValue.match(/^[a-zA-Z0-9.]+@[a-zA-Z0-9-_]+?\.[a-zA-Z]{2,4}$/)){
                        isOk = true;
                    }else{
                        errorMessage = scope.emailInvalid;
                        isOk = false;
                    }                    
                }
                if(attr.validateType == 'password'){
                    if(inputValue.length < 5){
                        errorMessage = scope.passwordLengthShort;
                        isOk = false;
                    }else
                    if(inputValue.length > 250){
                        errorMessage = scope.passwordLengthLong;
                        isOk = false;
                    }else{
                        isOk = true;
                    }  
                }
                if(attr.validateType == 'same'){
                    var validateClass = "."+attr.validateType+attr.validateId;
                    //console.log(validateClass);
                    //console.log(angular.element(validateClass));
                    //console.log(angular.element(validateClass).val());
                    if(inputValue == angular.element(validateClass).val()){
                        isOk = true;
                    }else{
                        isOk = false;//errorMessage = scope.confirmEmail;alert(attr.type);
                        if(attr.type == "text"){
                            errorMessage = scope.confirmEmail;
                        }
                        if(attr.type == "password" ){
                            errorMessage = scope.confirmPassword;
                        }
                    }   
                }
                // console.log(scope);
                // console.log(attr.validateType);
                // console.log(ngModelCtrl);
                //console.log(elm);
                if(inputValue.length ==0){
                    isEmpty = true;
                }

                





                elm.parent().find('.validation-message').remove();
                elm.parent().find('p').remove();
                if(isOk == true){
                    elm.parent().css("border-color","#8fc146");
                    //scope.signForm[attr.name].$valid = true;
                    scope.signForm[attr.name].$setValidity('valid',true);
                    //return;
                }                
                if(isOk == false){
                    scope.signForm[attr.name].$setValidity('valid',false);
                    elm.parent().css("border-color","#e60020"); 
                    //scope.signForm[attr.name].$valid = false;  

                    elm.parent().append("<p class='validation-message'>"+errorMessage+"<p>");
                    //console.log("<p class='validation-message'>"+errorMessage+"<p>");
                    //elm.parent().css("border-color":"red") ;
                }
                if(isEmpty == true){
                    //scope.signForm[attr.name].$setValidity(false);
                    elm.parent().css("border-color","#000000");
                    elm.parent().find('.validation-message').remove();
                    elm.parent().find('p').remove();
                    scope.signForm[attr.name].$valid = false;
                    //return;
                }
                // scope.$apply(function() {
                //     ngModelCtrl.$setViewValue(elm.val());
                // });
                console.log(scope.signForm[attr.name]);
                console.log(scope.signForm[attr.name].$valid);
                //removeBlurMonitoring(scope, elm, attr, ngModelCtrl);               
                // if(isOk == true){
                //     console.log(scope.signForm[attr.name]);
                //     //scope.signForm[attr.name].$setValidity(true);
                //     scope.signForm[attr.name].$valid = true;
                    
                //     //console.log(scope.signForm[attr.name].$valid);
                // }                
                // if(isOk == false){
                //     scope.signForm[attr.name].$valid = false;
                // }
            });
        }
    };
});










// function formController($scope, $http) {
//    $scope.formData = {};
//    $scope.processForm = function() {
//        var nameLengthShort = "Name should be more than 3 characters";
//        var nameLengthLong = "Name should not be more than 255 characters";
//        var nameCharacters = "Name should contain only characters";
//        var emailInvalid = "Not a valid email";
//        var emailLengthLong = "Email should not be more than 255 characters";
//        var confirmEmail = "Emails are different";
//        var setPassword = "Password should contain atleast 5 characters";
//        var confirmPassword = "Passwords are different";


//       $scope.formData.user_type = 'borrower';
//       $scope.formData.title = "Mr";
//       $scope.formData.first_name = "Shruti";
//       $scope.formData.middle_name = ""  ;
//       $scope.formData.last_name = "Madan" ;
//       $scope.formData.email = 'shrutim@langoor.com';
//       $scope.formData.email_confirmation =  'shrutim@langoor.com';
//       $scope.formData.password =  '123456';
//       $scope.formData.password_confirmation =  '123456 ';
//       // 'user_type' : 'borrower'/'investor' 
//       // 'title' : "Mr/Mrs/Ms "
//       // 'first_name' : "Shruti "
//       // 'middle_name':  
//       // 'last_name' : 'Madan' 
//       // 'email' : 'shrutim@langoor.com '
//       // 'email_confirmation' : 'shrutim@langoor.com '
//       // 'password' : '123456 '
//       // 'password_confirmation' : '123456 '
//       console.log($scope.formData);
//       $http({
//            method  : 'POST',
//            url     : '/register',
//            data    : $scope.formData,  // pass in data as strings
//        })
//            .success(function(data) {
//                $scope.serverResponse = data.status_message;
//                $scope.statusCode = data.status_code;
//                console.log(data);
//                alert("worked");
//                if (!data.success) {
//                   // if not successful, bind errors to error variables
//                   $scope.serverResponse = data.status_message;
//                    $scope.errorName = data.errors.name;
//                    $scope.errorSuperhero = data.errors.superheroAlias;
//                } else {
//                   // if successful, bind success message to message
//                    $scope.message = data.message;
//                }
//            });
//    };
// }
