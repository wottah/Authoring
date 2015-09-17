//Factory which handles login communication with data layer
angular.module('modelbuilder').factory('DatabaseFactory', function($http) {
  var DatabaseFactory = {};
  DatabaseFactory.login = function(credentials) {
    var promise = $http({
      method: "GET",
      url: "scripts/data/index.php",
      params: {
        action: "login",
        user: credentials.name,
        pass: credentials.pass
      }
    }).then(function(response){
      return response.data;
    });
    return promise;
  };

  DatabaseFactory.getProjects = function(username) {
    var promise = $http({
      method: "GET",
      url:"scripts/data/index.php",
      params: {
        action:"getProjects",
        user: username
      }
    }).then(function(response){
      return response.data;
    });
    return promise;
  };

  DatabaseFactory.saveProject = function(project, user){
    var promise = $http({
      method: "GET",
      url:"scripts/data/index.php",
      params: {
        action:"saveProject",
        user: user,
        name: project.name,
        description: project.description,
        data: angular.toJson(project.data)
      }
    }).then(function(response){
      return response.data;
    });
    return promise;
  };
  return DatabaseFactory;
});
