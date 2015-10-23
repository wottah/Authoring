//Service which holds the user session
angular.module('modelbuilder').service('SessionService', function(ConceptService, RuleService, DatabaseFactory, $q){
  var authorised = false;
  var username = "";
  var currentproject = [];

  this.login = function(credentials){
    return DatabaseFactory.login(credentials);
  };

  this.register = function(credentials){
    return DatabaseFactory.register(credentials);
  }

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
    for(var r in project.data.rules){
      project.data.rules[r].source = {};
      project.data.rules[r].target = {};
      for(var i in project.data.concepts){
        if(project.data.concepts[i].id == project.data.rules[r].sourceId){
          project.data.rules[r].source = project.data.concepts[i] ;
        }
        if(project.data.rules[r].targetId != null && project.data.concepts[i].id == project.data.rules[r].targetId){
          project.data.rules[r].target = project.data.concepts[i];
        }
      }
    }
    RuleService.setProject(project.data.rules, project.data.relations);
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
    saveRuleNoRefs = [];
    saveRuleRefs = RuleService.getRules();
    for(var r in saveRuleRefs){
      saveRule = {};
      saveRule.id = saveRuleRefs[r].id;
      saveRule.sourceId = saveRuleRefs[r].sourceId;
      saveRule.targetId = saveRuleRefs[r].targetId;
      saveRule.name = saveRuleRefs[r].name;
      saveRule.defaultRule = saveRuleRefs[r].defaultRule;
      saveRule.category = saveRuleRefs[r].category;
      saveRuleNoRefs.push(saveRule);
    }
    data = {concepts:saveConcepts, rules:saveRuleNoRefs, relations:RuleService.getCustomRelations()};
    currentproject.data = data;
    DatabaseFactory.saveProject(currentproject, username);
  };

  this.deleteProject = function(name){
    DatabaseFactory.deleteProject(name, username);
  }
});
