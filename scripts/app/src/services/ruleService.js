//Service that contains, manages and discloseas all current rules.
angular.module('modelbuilder').service('RuleService', function(DefaultPropsFac, SupportService){
  //contains all rules in the current project.
  var rulesList = [];
  //contains all types of rules curently available to the project.
  var ruleTypeList = [];
  DefaultPropsFac.LoadRules().then(function(data){
    ruleTypeList = data;
    for(var r in ruleTypeList)
    {
      ruleTypeList[r].properties = SupportService.matchtypes(ruleTypeList[r].properties);
    }
  });

  this.setRules = function(rules){
    rulesList = rules;
  }

  this.getRules = function(){
    return rulesList;
  }

  this.getRuleTypeList = function(){
    return ruleTypeList;
  };

  this.getRule = function(name){
    for(var r in ruleTypeList){
      if(ruleTypeList[r].name == name){
        return ruleTypeList[r];
      }
    }
    return null;
  }

  this.getItemRules = function(id){
    var returnList = [];
    for(var r in rulesList){
      if(rulesList[r].source.id == id | rulesList[r].target.id == id){
        returnList.push(rulesList[r]);
      }
    }
    return returnList;
  }

  //adds an item to the rule list.
  this.addRule = function(source, target, rule, def){
    if(source==null | rule==null)
    {
      return;
    }
    if(target == null)
    {
      target = {text:"", id:""};
    }
    //checks if the rule+target combination is not already added to this topic.
    dupe = false;
    var newId = {id: target.id + rule.name + source.id};

    if(SupportService.contains(newId,"id",source.rules)>-1)
    {
      dupe = true;
    }
    if(source!=="" && !dupe)
    {
      var newrule = {id: newId.id, source:source, target: target, name: rule.name, defaultRule:def };
      //adds rule properties to the topic parameters. Sets the item to a rule parameter if it aleady exists (so the user cannot delete it).
      ruleIndex = SupportService.contains(newrule,"name",ruleTypeList);
      if(ruleIndex != -1)
      {
        ruledef = ruleTypeList[ruleIndex];
      }
      rulesList.push(newrule);
      return ruledef.properties;
    }
  };

  this.removeRule = function(ruleId){
    for(var r in rulesList){
      if(rulesList[r].id == ruleId){
        rulesList.splice(r,1);
      }
    };
  }
});
