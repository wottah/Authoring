//This controller takes care of all the concept settings and properties
angular.module('modelbuilder').controller('SettingsController', function($scope, $modalInstance, SessionService, RuleService, ConceptService, SupportService){
  //import rules list and assign reference to DefaultTypes to Properties
  $scope.ruleTypeList = RuleService.getRuleTypeList();
  $scope.booleanTypeList = RuleService.getBooleanTypeList();
  $scope.knowledgeTypeList = RuleService.getKnowledgeTypeList();
  $scope.ruleSelectList= [{name:"All"}];
  $scope.defaultParams = ConceptService.getDefaultParams();
  $scope.selectedDefParam = $scope.defaultParams[0];
  for(var l in $scope.ruleTypeList)
  {
    $scope.ruleSelectList.push($scope.ruleTypeList[l]);
  }
  $scope.selectedrule = $scope.ruleSelectList[0];
  $scope.defaultTypes = SupportService.getDefaultTypes();
  $scope.selectedNewType = $scope.defaultTypes[0];
  $scope.selectedDefParamRule = $scope.booleanTypeList[0];

  this.allSelected = function(){
    if($scope.selectedrule.name=="All")
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  //adds an item to the prereq list of the current settingsItem.
  this.addRule = function(source, target, rule, ruleCat){
    ruleprops = RuleService.addRule(source,target,rule, false, ruleCat);
    for(var r in ruleprops){
      ConceptService.addParameter(source.id, ruleprops[r].name, ruleprops[r].type, ruleprops[r].defval, ruleprops[r].defval, true, rule.name);
    }
    SessionService.saveProject();
    $scope.selectedrule = $scope.ruleSelectList[0];
  };

  //removes rule from the list of rules of the current settingsItem
  this.removeRule = function(rule, item) {
    ruleDefinition = RuleService.getRule(rule.name);
    //If no other rules rely on this one -> delete the property dependancy
    allRules = RuleService.getRules();
    for(var r in ruleDefinition.properties){
      hasDependancy = false;
      for(var ar in allRules){
        if(rule.id != allRules[ar].id && SupportService.contains(ruleDefinition.properties[r],["name","type"],allRules[ar].properties)!=-1){
          hasDependancy = true;
        }
      }
      if(!hasDependancy){
        if(ruleDefinition.properties[r].defval==""){
          ConceptService.removeParameter(rule.source,ruleDefinition.properties[r]);
        }
        else{
          ConceptService.removeRuleParamDependancy(rule.source.id, ruleDefinition.properties[r].name, ruleDefinition.properties[r].type);
        }
      }
    }
    //Also remove the rule
    RuleService.removeRule(rule.id);
    SessionService.saveProject();
  };

  //adds a parameter to the paramlist of the current settingsItem.
  this.addParam = function(target, addName, addType, addValue){
    ConceptService.addParameter(target.id, addName, addType, addValue, null, false, null);
    SessionService.saveProject();
  };

  //removes param from the list of parameters of the current settingsItem
  this.removeParam = function(target, removeParam){
    ConceptService.removeParameter(target, removeParam);
    SessionService.saveProject();
  };

  this.getItemRules = function(id){
    return RuleService.getItemRules(id);
  }

  //closes modal isntance and saves data.
  this.ok = function () {
    $modalInstance.close();
  };

  this.isCalculated = function (param) {
    if(param.defval=="")
    {
      return true;
    }
    return false;
  };

  this.unaryRuleSelected = function(rule){
    if(rule != null && rule.type == "unary"){
      return true;
    }
    return false;
  };

  this.isDefRule = function(rule, id){
    itemRules = RuleService.getItemRules(id);
    for(var r in itemRules){
      if(itemRules[r].name == rule.name){
        return itemRules[r].defaultRule;
      }
    }
  };

  this.defParamSelectedRulesList = function(selectedParam, selectedItem){
    if(selectedParam.name == "suitability" | selectedParam.name == "availability"){
      $scope.selectedDefParamRule = $scope.booleanTypeList[0];
      return this.ruleSelectList(selectedItem,$scope.booleanTypeList);
    }
    if(selectedParam.name == "knowledge"){
      $scope.selectedDefParamRule = $scope.knowledgeTypeList[0];
      rulesList = RuleService.getItemRules($scope.settingsItem.id);
      for(var r in rulesList){
        if(rulesList[r].category == "knowledge"){
          return [];
        }
      }
      return this.ruleSelectList(selectedItem,$scope.knowledgeTypeList);
    }
  };

  this.ruleSelectList = function(selectedItem, ruleList) {
    for(var r in ruleList){
      selectedItemRules = RuleService.getItemRules(selectedItem.id);
      index = SupportService.contains(ruleList[r],"name",selectedItemRules);
      if(index!= -1 && ruleList[r].type=="unary"){
        ruleList[r].disabled=true;
      }
      else{
        ruleList[r].disabled=false;
      }
    }
    return ruleList;
  };

  this.saveProject = function(){
    SessionService.saveProject();
  };

  this.defParamChanged = function(defparam, item){
    $scope.selectedDefParamRule = this.defParamSelectedRulesList(defparam, item)[0];
  };
});
