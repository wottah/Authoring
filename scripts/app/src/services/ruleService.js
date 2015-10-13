//Service that contains, manages and discloseas all current rules.
angular.module('modelbuilder').service('RuleService', function(DefaultPropsFac, SupportService){
  //contains all rules in the current project.
  var rulesList = [];
  //contains all types of rules curently available to the project.
  var persistentRuleTypeList = [];
  var attRuleTypeList = [];
  DefaultPropsFac.LoadRules().then(function(data){
    persistentRuleTypeList = data.persistent_att_rules;
    attRuleTypeList = data.def_att_rules;
    for(var r in persistentRuleTypeList)
    {
      persistentRuleTypeList[r].properties = SupportService.matchtypes(persistentRuleTypeList[r].properties);
    }
  });

  this.setRules = function(rules){
    rulesList = rules;
  };

  this.getRules = function(){
    return rulesList;
  };

  this.getRuleTypeList = function(){
    returnlist = []
    for(var p in persistentRuleTypeList){
        returnlist.push(persistentRuleTypeList[p]);
    }
    for(var a in attRuleTypeList){
        returnlist.push(attRuleTypeList[a]);
    }
    return returnlist;
  };

  this.getPersistentTypeList = function(){
    return persistentRuleTypeList;
  };

  this.getAttRuleTypeList = function(){
    return attRuleTypeList;
  };

  this.getRule = function(name){
    for(var r in persistentRuleTypeList){
      if(persistentRuleTypeList[r].name == name){
        return persistentRuleTypeList[r];
      }
    }
    for(var r in attRuleTypeList){
      if(attRuleTypeList[r].name == name){
        return attRuleTypeList[r];
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
    var newId = {id: target.id + rule + source.id};

    if(SupportService.contains(newId,"id",rulesList)>-1)
    {
      dupe = true;
    }
    if(source!=="" && !dupe)
    {
      var newrule = {id: newId.id, sourceId: source.id, source:source, targetId: target.id, target: target, name: rule, defaultRule:def};
      //adds rule properties to the topic parameters. Sets the item to a rule parameter if it already exists (so the user cannot delete it).
      ruleIndex = SupportService.contains(newrule,"name",persistentRuleTypeList);
      if(ruleIndex != -1){
        ruledef = persistentRuleTypeList[ruleIndex];
      }
      ruleIndex = SupportService.contains(newrule,"name",attRuleTypeList);
      if(ruleIndex != -1){
        ruledef = attRuleTypeList[ruleIndex];
      }
      rulesList.push(newrule);
      if(ruledef.properties != null){
        return ruledef.properties;
      }
      else{
        return [];
      }
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
