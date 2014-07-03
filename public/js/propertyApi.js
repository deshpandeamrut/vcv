var searchPropertyApp = angular.module('searchPropertyApp', []);

searchPropertyApp.controller('propertyApiSearchFilter', ['$scope', '$http',

function ($scope, $http) {



	$scope.activePropertiesData = {};
	$scope.propertyData = {}
	$scope.activePropertiesDataLength = true;
	$scope.searchDataQuery = '';

	$scope.sendingData = {
	    "min_price": "",
	    "max_price": "",
	    "bedroom_min": "",
	    "bedroom_max": "",
	    "place_name": "",
	    "street": "",
	    "town": "",
	    "postcode": "",
	    "county": "",
	    "country_name": "UK",
	    "page_number" : "1"
  	};

  	var searchCriteria = $.jStorage.get('propertyApiSearchCriteria');
  	console.log(searchCriteria);

  	$http({
        method: 'GET',
        url: '/getUserBasicDetails'
    }).success(function (data) {
        jQuery('#overlay').addClass('hide');
        $scope.dashboardData = data.data;
        if (data.status_code == 401 || data.status_code == '401') {
            jQuery.pnotify({
                text: data.data.Reason,
                type: "error"
            });
            setTimeout(function(){window.location.href = "/index.html";},2000);
        }  else {
        	 if(typeof(searchCriteria) != 'undefined' && searchCriteria != null && searchCriteria != '') {
		  		jQuery('#overlay').removeClass('hide');
		  		$scope.sendingData = searchCriteria;
			  	$http({
				    method  : 'POST',
				    url     : 'getPropertiesbyApi',
				    data    : searchCriteria  // pass in data as strings
				}).success(function(data) {
					jQuery('#overlay').addClass('hide');
				    console.log(data);
				    console.log(typeof(data));
				    $scope.searchDataQuery = searchCriteria.place_name;
				    $scope.activePropertiesData = data;
				    $scope.activePropertiesDataLength = jQuery.isEmptyObject(data);
				});
			} else {
				jQuery('#overlay').removeClass('hide');
		  		$scope.sendingData.country_name = 'UK';
		  		$scope.sendingData.place_name = "birmingham";
			  	$http({
				    method  : 'POST',
				    url     : 'getPropertiesbyApi',
				    data    : $scope.sendingData  // pass in data as strings
				}).success(function(data) {
					jQuery('#overlay').addClass('hide');
				    console.log(data);
				    console.log(typeof(data));
				    $scope.searchDataQuery = $scope.sendingData.place_name;
				    $scope.activePropertiesData = data;
				    $scope.activePropertiesDataLength = jQuery.isEmptyObject(data);
				});
			}
        }
    });

 

	$scope.submitSearch = function() {
		$.jStorage.set('propertyApiSearchCriteria', $scope.sendingData);
		jQuery('#overlay').removeClass('hide');
		console.log($scope.sendingData)
		 $http({
		      method  : 'POST',
		      url     : 'getPropertiesbyApi',
		      data    : $scope.sendingData  // pass in data as strings
    	}).success(function(data) {
    		jQuery('#overlay').addClass('hide');
	        console.log(data);
	        console.log(typeof(data));
	        $scope.searchDataQuery = $scope.sendingData.place_name;
	        $scope.activePropertiesData = data;
	        $scope.activePropertiesDataLength = jQuery.isEmptyObject(data);
   		});
	}

	$scope.fullDetails  = function(id) {
		console.log(id)
		// console.log($scope.activePropertiesData[id]);
		// $scope.propertyData = $scope.activePropertiesData[id];
		$.jStorage.set(id, $scope.activePropertiesData[id]);
		window.location.href = 'individualPropertyDetails.html#'+id;
	}

    jQuery('.paginationContainer').on('click','a',function(e) {
        var pageNumber = parseInt(jQuery(e.currentTarget).text());
        $scope.sendingData.page_number = pageNumber;
        e.preventDefault();
        jQuery('#overlay').removeClass('hide');
        $http({
		      method  : 'POST',
		      url     : 'getPropertiesbyApi',
		      data    : $scope.sendingData  // pass in data as strings
    	}).success(function(data) {
    		jQuery('#overlay').addClass('hide');
	        console.log(data);
	        console.log(typeof(data));
	        $scope.activePropertiesData = data;
	        $scope.activePropertiesDataLength = jQuery.isEmptyObject(data);
   		});
    });

    jQuery('#countryElementBox').on('change',function(e) {
    	var currentTarget = jQuery(e.currentTarget);
    	var propertySearchDetailsHolder = jQuery('.property_search_details-hold');
    	var filterBox = jQuery('#filterBox');
    	var usContainer = jQuery('.property_search_details-us');
    	var ausContainer = jQuery('.property_search_details-aus');
    	if(currentTarget.val() == "AUS") {
    		propertySearchDetailsHolder.hide();
    		filterBox.hide();
    		usContainer.addClass('hide');
    		ausContainer.removeClass('hide');
    	} else if (currentTarget.val() == "US") {
    		propertySearchDetailsHolder.hide();
    		filterBox.hide();
    		usContainer.removeClass('hide');
    		ausContainer.addClass('hide');
    	} else {
    		propertySearchDetailsHolder.show();
    		filterBox.show();
    		usContainer.addClass('hide');
    		ausContainer.addClass('hide');
    	}
    });

}]
);