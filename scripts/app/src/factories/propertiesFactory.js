//Factory which handles the loading of default settings.
angular.module('modelbuilder').factory('DefaultPropsFac', function($http) {
  var DefaultPropsFac = {};
  
  DefaultPropsFac.LoadDefaults = function() {
    var promise = $http.get('properties/default-behaviour.json').then(function(response){
      return response.data;
    });
    return promise;
  };
  DefaultPropsFac.LoadRules = function() {
    var promise = $http.get('properties/rules.json').then(function(response){
      return response.data;
    });
    return promise;
  };
  return DefaultPropsFac;
});
