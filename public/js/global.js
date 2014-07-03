// OuterHTML jquery simple plugin from css tridks
$.fn.outerHTML = function(){
    // IE, Chrome & Safari will comply with the non-standard outerHTML, all others (FF) will have a fall-back for cloning
    return (!this.length) ? this : (this[0].outerHTML || (
      function(el){
          var div = document.createElement('div');
          div.appendChild(el.cloneNode(true));
          var contents = div.innerHTML;
          div = null;
          return contents;
    })(this[0])); 
}

var phoneInput = {
            "phone_type": "mobile",
            "phone_usage_type": "user",
            "phone_country_code": "91",
            "phone_city_code": "11",
            "phone_number": "21423534" };
var phone1=[];
var phone2=[];
var card1=[];
var card2=[];
var loan1=[];
var loan2=[];
var liability1=[];
var liability2=[];

function pushInputValues(){

}

function readValues(parentElement, repeatedElement,inputObject, storeValue){
  //return "ok";
  //var inputQuery = '.'+parentElement+" ."+repeatedElement+" .inputvalue"; 
  // var inputQuery = '.'+parentElement+" .inputvalue";
  // var totalInput = $(inputQuery).length;
  // var inputGroup = inputList.length;
  // var repeatGroup = totalInput/inputGroup;
  // var wrapperObject = {};
  // var arrayIndex, nthElement,objectKey;
  // console.log(inputList);
  // $(inputQuery).each(function(index,element){
  //    index = index+1;
  //    arrayIndex = ((index-1)%inputGroup);

  //    nthElement = Math.ceil(index/inputGroup);
  //    objectKey = inputList[arrayIndex]+"_"+nthElement;
  //    wrapperObject[objectKey] = $(this).val();
  //    console.log(index, arrayIndex, totalInput, inputGroup, nthElement,objectKey );
  //    // wrapperObject[]
  //    // console.log(element);
  //    // console.log($(this));
  // });
  var objectArray = storeValue;
  var inputObject = {};
  //var inputObject = {};
  //var inputList = inputList;
  var inputQuery = '.'+parentElement+" ."+repeatedElement;
  console.log(inputObject);
  console.log(inputQuery);
  console.log($(inputQuery));
  console.log($(inputQuery).length);

  var total = $(inputQuery).length;
  $(inputQuery).each(function(index,element){
    var totalInner = $(this).find(".inputvalue").length;
    console.log($(this).find(".inputvalue").length);

    console.log('first',index, (total-1));

    $(this).find(".inputvalue").each(function(i,e){
      var jsonName = $(this).attr('json-data');
      //console.log(jsonName);
      //console.log($(this).prop('tagName'));
      //console.log(jsonName, $(this).tagName );
      if($(this).prop('tagName') == 'div' || jsonName == undefined){
        if(i==(totalInner-1)){
          objectArray.push(inputObject);
        }
        return true;
      }
      //console.log(jsonName);
      inputObject[jsonName] = $(this).val();
      if($(this).prop('tagName') == 'select'){
        inputObject[jsonName] = $(this).selectpicker('val');
      }else{
        inputObject[jsonName] = $(this).val();
      }
      console.log(inputObject);
      console.log($(this).val(), inputObject[jsonName] , i, (totalInner-1));
      //console.log(inputObject[jsonName]);

      if(i==(totalInner-1)){
        objectArray.push(inputObject);
        inputObject = {};
      }//objectArray.push(inputObject);
      //console.log(objectArray);
      if(index==(total-1)){
        console.log(objectArray);
        //storeValue = objectArray;
        //return objectArray;
        //return 'ok';
      }
    });

    console.log('second',index, (total-1));

    
  });
  
}
function populateValues(parentElement, repeatedElement,inputObject){
  // if(parentClass == ''){
  //    dataObject = 
  // }
  var fieldQuery = '.'+parentClass+' .inputvalue';
  $(fieldQuery).each(function(index,element){
     if($(this).hasClass('selectpicker')){
        $(this).selectpicker('val', value);
     }else{
        $(this).val(value);
     }
  });
  
}
function renderFields(parentElement, repeatedElement, numberOfFields) {
  // for(var i=0;i<numberOfFields;i++){
  //    addFields(parentElement, repeatedElement);
  // }
}

function addFields(parentElement, repeatedElement) {
  //alert('hi');
  var currentValue = {};
  var count = 0;
  var query;
  var repeatedId = [];
  var highestId;
  var availableId;
  var i=1;
  var recentlyAdded;
  //alert('hi');
    var totalRepeatedFieldsQuery = '.'+parentElement+" "+"."+repeatedElement;
    var repeatedElementQuery = "."+repeatedElement;
    var repeatedElementFirst = $(totalRepeatedFieldsQuery).first();
    // totalRepeatedFields = ($(totalRepeatedFieldsQuery).length)*numberOfFields;
    var parentClass = '.'+parentElement;
    //console.log(repeatedElementFirst.outerHTML());
    $(parentClass).append(repeatedElementFirst.outerHTML());
    var totalRepeated = $(totalRepeatedFieldsQuery).length;
    $(totalRepeatedFieldsQuery).each(function(index,element){
        var repeatedValue = parseInt($(this).attr('inputId')/10);
        //$(this).attr('inputId');
        //console.log($(this).attr('inputId'),parseInt($(this).attr('inputId')/10),$(this).attr('inputId')%10);
        if(repeatedId.indexOf(repeatedValue)==-1){
          repeatedId.push(repeatedValue);
        }
        // if((index+1)==totalRepeated){
        //   repeatedId.sort();
        // }

    });
    console.log(repeatedId);
    while(true){
      if(repeatedId.indexOf(i)==-1){
        availableId = i;
        break;
      }
      i++;
    }
    recentlyAdded = $(totalRepeatedFieldsQuery).last();
    var topAttribute = availableId+"0";
    // console.log(topAttribute);
    // console.log(recentlyAdded.attr('inputid'),recentlyAdded.attr('inputid'));
    // console.log(recentlyAdded.find(repeatedElementQuery));
    // console.log(recentlyAdded.find(repeatedElementQuery).first());

    recentlyAdded.removeAttr( "inputid" ).attr("inputid",topAttribute);
    recentlyAdded.find('.inputvalue').each(function(index,element){
      var inputAttribute = availableId+""+(index+1);
      var modelAttribute = parentElement+(availableId+""+(index+1));
      var nameAttribute = parentElement+(availableId+""+(index+1));
      $(this).removeAttr('inputid').attr('inputid',inputAttribute);
      $(this).removeAttr('ng-model').attr('ng-model',modelAttribute);
      $(this).removeAttr('name').attr('name',modelAttribute);
    });
    var elementNumberQuery = parentClass+" "+".repeatNum";
    var inputFieldQuery = parentClass+" "+".inputvalue";
    // console.log(elementNumberQuery);
    // console.log(totalRepeatedFieldsQuery);
    // console.log(repeatedElementQuery);
    // console.log(repeatedElement);
    $(elementNumberQuery).each(function(index,element){
        $(this).html(index+1);
        // $(this).attr('inputId');
        // console.log($(this).attr('inputId'),$(this).attr('inputId')/10,$(this).attr('inputId')%10);
    });

    //readValues('creditCardInput','repeatOnClick',creditCardFields);
    //readValues('phoneInput2', 'repeatOnClick',phoneInput);

}
function removeFields(parentClass, repeatedElement) {
  var elementNumberQuery = "."+parentClass+" "+".repeatNum";
  $(elementNumberQuery).each(function(index,element){
     $(this).html(index+1);
  });
  $(this).parent().parent().remove();
}

function addSingleField(parentElement,repeatedElement){
  var repeatedId = [];
  var i=1;
  var recentlyAdded;
  //alert('hi');
    var totalRepeatedFieldsQuery = '.'+parentElement+" "+"."+repeatedElement;
    var totalFieldsQuery = '.'+parentElement+" "+".inputvalue";
    var repeatedElementQuery = "."+repeatedElement;
    var repeatedElementFirst = $(totalRepeatedFieldsQuery).first();
    // totalRepeatedFields = ($(totalRepeatedFieldsQuery).length)*numberOfFields;
    var parentClass = '.'+parentElement;
    //console.log(repeatedElementFirst.outerHTML());
    $(parentClass).append(repeatedElementFirst.outerHTML());
    //var totalRepeated = $(totalRepeatedFieldsQuery).length;
    $(totalFieldsQuery).each(function(index,element){
        var repeatedValue = parseInt($(this).attr('inputid'));
        if(repeatedId.indexOf(repeatedValue)==-1){
          repeatedId.push(repeatedValue);
        } 
    });
    console.log(repeatedId);
    while(true){
      if(repeatedId.indexOf(i)==-1){
        availableId = i;
        break;
      }
      i++;
    }
    recentlyAdded = $(totalRepeatedFieldsQuery).last().find('.inputvalue');
    var topAttribute = availableId;
    // console.log(topAttribute);
    // console.log(recentlyAdded.attr('inputid'),recentlyAdded.attr('inputid'));
    // console.log(recentlyAdded.find(repeatedElementQuery));
    // console.log(recentlyAdded.find(repeatedElementQuery).first());
    var modelAttribute = parentElement+(availableId);
    recentlyAdded.removeAttr( "inputid" ).attr("inputid",topAttribute);
    recentlyAdded.removeAttr('ng-model').attr('ng-model',modelAttribute);
    // recentlyAdded.find('.inputvalue').each(function(index,element){
    //   var inputAttribute = availableId+""+(index+1);
    //   var modelAttribute = parentElement+(availableId+""+(index+1));
    //   $(this).removeAttr('inputid').attr('inputid',inputAttribute);
    //   $(this).removeAttr('ng-model').attr('ng-model',modelAttribute);
    // });
  
}
function removeSingleField(parentClass, repeatedElement) {
  // var elementNumberQuery = "."+parentClass+" "+".repeatNum";
  // $(elementNumberQuery).each(function(index,element){
  //    $(this).html(index+1);
  // });
  $(this).parent().parent().remove();
}
// dashboard left menu functionality
$('.dash-menu-nav li').on('click',function(){
  $('.dash-menu-nav .active').removeClass('active');
  $(this).find('a').addClass('active');
});

