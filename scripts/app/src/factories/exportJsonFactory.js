//This Factory is used to deploy GALE projects using a PHP data-connection
angular.module('modelbuilder').factory('ExportJsonFactory', function($http) {
  var ExportJsonFactory = {};

  //deploys gam code to file location through PHP.
  ExportJsonFactory.deploy = function(project, user, gamcode){
    postObj = {
      projectname : project,
      username : user,
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

  //saves project as JSON file through PHP
  ExportJsonFactory.saveFile = function(username,projectname, json){
    postObj = {
      name : username + projectname,
      data : angular.toJson(json)
    };
    var promise = $http({
      method:"POST",
      url:"scripts/data/index.php",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data:postObj,
      params: {action:"saveProject"}
    }).then(function(response){
      return response.data;
    });
    return promise;
  };

  //loads project as JSON file through PHP
  ExportJsonFactory.loadFile = function(username,projectName){
    var promise = $http({
      method:"POST",
      url:"scripts/data/index.php",
      params: {action:"loadProject", name: username + projectName}
    }).then(function(response){
      return response.data;
    });
    return promise;
  };
  return ExportJsonFactory;
});
