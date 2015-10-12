//This Factory is used to deploy GALE projects using a PHP data-connection
angular.module('modelbuilder').factory('DeploymentFactory', function($http) {
  var DeploymentFactory = {};

  DeploymentFactory.deploy = function(name, gamcode){
    postObj = {
      name : name,
      content : gamcode
    };
    var promise = $http({
      method:"POST",
      url:"scripts/data/index.php",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data:postObj,
      params: {action:"deploy"}
    }).then(function(response){
      return response.data;
    });
    return promise;
  };
  return DeploymentFactory;
});
