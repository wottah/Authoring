//Service which holds the user session
angular.module('modelbuilder').service('SessionService', function(ConceptService, RuleService, DatabaseFactory, $q){
  var authorised = false;
  var username = "";
  var currentproject = [];

  this.login = function(credentials){
    return DatabaseFactory.login(credentials);
  };

  this.authorise = function(user){
    authorised = true;
    username = user;
  }

  this.logout = function(){
    authorised = false;
  };

  this.isAuthorised = function(){
    return authorised;
  };

  this.getUsername = function(){
    return username;
  };

  this.setCurrentProject = function(project){
    ConceptService.setConcepts(project.data.concepts);
    RuleService.setRules(project.data.rules);
    currentproject = project;
  };

  this.getCurrentproject = function(){
    return currentproject;
  };

  this.getProjects = function(){
    return DatabaseFactory.getProjects(username);
  };

  this.newProject = function(name, description){
    project={name:name, description:description, data:{concepts:[], rules:[]}};
    this.setCurrentProject(project);
    DatabaseFactory.saveProject(project, username);
  };

  this.saveProject = function(){
    saveConcepts = ConceptService.getConcepts();
    saveRules = RuleService.getRules();
    data = {concepts:saveConcepts, rules:saveRules};
    currentproject.data = data;
    DatabaseFactory.saveProject(currentproject, username);
  }
});
