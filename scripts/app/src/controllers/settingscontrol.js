//This controller takes care of all the concept settings and properties, it controls the settings screen.
angular.module('modelbuilder').controller('SettingsController', function($scope, $modalInstance, SessionService, RuleService, ConceptService, SupportService){
  //import rules list and assign reference to DefaultTypes to Properties
  $scope.ruleTypeList = RuleService.getRuleTypeList();
  $scope.ruleSelectList= [{name:"All"}];
  for(var l in $scope.ruleTypeList)
  {
    $scope.ruleSelectList.push($scope.ruleTypeList[l]);
  }
  $scope.addRuleCollapsed = false;
  $scope.selectedItem = [];
  $scope.selectedrule = $scope.ruleSelectList[0];
  $scope.defaultTypes = SupportService.getDefaultTypes();
  $scope.selectedNewType = $scope.defaultTypes[0];
  $scope.relationName = "";
  $scope.relationDesc = "";
  $scope.parentLevel = {current:0, backwards:0};
  $scope.hideAddRelation = true;
  //determines whether templated rules and parameters should be shown or not.
  $scope.showTemplated = false;

  //simply returns true if the "all" option is selected in the rules filter, otherwise returns false (used in html show/hide controls).
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
  this.addRule = function(source, targets, rule){
    if(rule.type=="binary"){
      for(var t in targets){
        if(source.id != targets[t].id){
          ruleprops = RuleService.addRule(source,targets[t],rule.name, false);
          for(var r in ruleprops){
            ConceptService.addParameter(source.id, ruleprops[r].name, ruleprops[r].type, ruleprops[r].defval, ruleprops[r].defval, false , true, rule.name);
          }
        }
      }
    }
    if(rule.type=="unary"){
      ruleprops = RuleService.addRule(source,null,rule.name, false);
      $scope.selectedrule = $scope.ruleSelectList[0];
      $scope.addRuleCollapsed = false;
      for(var r in ruleprops){
        ConceptService.addParameter(source.id, ruleprops[r].name, ruleprops[r].type, ruleprops[r].defval, ruleprops[r].defval, false, true, rule.name);
      }
    }
    SessionService.saveProject();
  };

  //removes rule from the list of rules of the current settingsItem
  this.removeRule = function(rule, item) {
    ruleDefinition = RuleService.getRule(rule.name);
    //If no other rules rely on this one -> delete the property dependancy
    allRules = RuleService.getRules();
    if(ruleDefinition.properties!=null){
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
    }
    //Also remove the rule
    RuleService.removeRule(rule.id);
    SessionService.saveProject();
  };

  //adds a parameter to the paramlist of the current settingsItem.
  this.addParam = function(target, addName, addType, addValue){
    ConceptService.addParameter(target.id, addName, addType, addValue, null, false, false, null);
    SessionService.saveProject();
  };

  //removes param from the list of parameters of the current settingsItem
  this.removeParam = function(target, removeParam){
    ConceptService.removeParameter(target, removeParam);
    SessionService.saveProject();
  };

  //get the rules and relations a particular concept is associated with.
  this.getItemRules = function(id){
    return RuleService.getItemRules(id);
  }

  //closes modal instance and saves data.
  this.ok = function () {
    $modalInstance.close();
  };

  //determines whether a value is calculated by a rule or not.
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

  //determines if the particular rule instance is a default (templated) rule.
  this.isDefRule = function(rule, id){
    itemRules = RuleService.getItemRules(id);
    for(var r in itemRules){
      if(itemRules[r].name == rule.name){
        return itemRules[r].defaultRule;
      }
    }
  };

  //checks what items in the rules select list should be disabled/enabled.
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

  this.getTooltip= function(name){
    return RuleService.getTooltip(name);
  }

  this.saveProject = function(){
    SessionService.saveProject();
  };

  //add a new non-pedagogical relation to the rules/relation list.
  this.addRelation = function(name, description){
    $scope.ruleSelectList.push(RuleService.addRelation(name, description));
    SessionService.saveProject();
    $scope.relationName = "";
    $scope.relationDesc = "";
    $scope.hideAddRelation = true;
  };

  //plus button to add new rules clicked.
  this.plusRule = function(item){
    $scope.addRuleCollapsed = !$scope.addRuleCollapsed;
    $scope.parentLevel.current = item.parent;
    if(item.parent > 0){
      $scope.parentLevel.backwards = ConceptService.getConcept(item.parent).parent;
    }
    else{
      $scope.parentLevel.backwards = item.id;
    }
  };

  //moving backwards in the rule target select box.
  this.rulesBackwards = function(){
    $scope.parentLevel.current = $scope.parentLevel.backwards;
    back = ConceptService.getConcept($scope.parentLevel.current);
    if(back!=null){
      $scope.parentLevel.backwards = back.parent;
    }
    else {
      $scope.parentLevel.backwards = $scope.parentLevel.backwards;
    }

  };

  //moving forwards in the rule target select box.
  this.rulesForwards = function(){
    if($scope.selectedItem[0]!=null && ConceptService.getConcept($scope.selectedItem[0].id).children.length>0){
        $scope.parentLevel.backwards = $scope.parentLevel.current;
        $scope.parentLevel.current = $scope.selectedItem[0].id;
    }
  };

  //determine of parameterised attribute is allowed to be deleted.
  this.disableDelete = function(param){
    if(param.ruleparam){
      return true;
    }
  };
});
