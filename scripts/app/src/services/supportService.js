//Service that provides oftenly reused code in order to avoid code duplication.
angular.module('modelbuilder').service('SupportService',function(DefaultPropsFac){
  var defaultTypes = ["String","Integer","Boolean","Double"];

  this.getDefaultTypes = function(){
    return defaultTypes;
  };

  this.getTopicTypes = function(){
    return topicTypes;
  };

  //matches type strings to indexes of the defaultTypes listitem
  this.matchtypes = function(paramList){
    for(var dt in defaultTypes)
    {
      for(var dp in paramList)
      {
        if(defaultTypes[dt].toLowerCase() == paramList[dp].type.toLowerCase())
        {
          paramList[dp].type = defaultTypes[dt];
        }
      }
    }
    return paramList;
  };
  //function that checks if item with property prop is in array
  this.contains = function(item, prop, array){
    //if item is a single value, prop remains empty.
    if(prop == "")
    {
      for(var i in array)
      {
        if(array[i].constructor === String){
          if(array[i].toLowerCase()==item.toLowerCase())
          {
            return i;
          }
        }
        else{
          if(array[i]==item)
          {
            return i;
          }
        }
      }
      return -1;
    }
    //if property prop from item i has to be checked
    else if(prop.constructor === String)
    {
      for(var i in array)
      {
        if(array[i][prop].toLowerCase()==item[prop].toLowerCase())
        {
          return i;
        }
      }
      return -1;
    }
    //if properties in prop[] have to be checked from item i; .constructor === Array
    else if(prop.constructor === Array)
    {
      for(var i in array)
      {
        //if there is a match
        if(array[i][prop[0]].toLowerCase()==item[prop[0]].toLowerCase())
        {
          var match = true;
          //if all other properties match as well
          for(var pp=1; pp<prop.length;pp++)
          {
            if(array[i][prop[pp]].toLowerCase()!=item[prop[pp]].toLowerCase())
            {
              match = false;
              pp= prop.length;
            }
          }
          if(match){ return i;}
        }
      }
      return -1;
    }
  };
});
