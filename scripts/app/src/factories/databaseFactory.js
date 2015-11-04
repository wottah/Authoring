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

  DatabaseFactory.register = function(credentials) {
    var promise = $http({
      method: "POST",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      url: "scripts/data/index.php",
      params: {
        action: "register"
      },
      data:credentials
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
    postObj = {
      user: user,
      name: project.name,
    };
    var promise = $http({
      method: "POST",
      url:"scripts/data/index.php",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data : postObj,
      params: {
        action:"saveProject"
      }
    }).then(function(response){
      return response.data;
    });
    return promise;
  };

  DatabaseFactory.newProject = function(project, user){
    var promise = $http({
      method: "POST",
      url:"scripts/data/index.php",
      params: {
        action:"newProject",
        user: user,
        name: project.name,
        description: project.description
      }
    }).then(function(response){
      return response.data;
    });
    return promise;
  };

  DatabaseFactory.deleteProject = function(name, user){
    var promise = $http({
      method: "POST",
      url:"scripts/data/index.php",
      params: {
        action:"deleteProject",
        user : user,
        name : name
      }
    }).then(function(response){
      return response.data;
    });
  };

  return DatabaseFactory;
});
