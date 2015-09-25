//Service that contains, manages and discloseas all current rules.
angular.module('modelbuilder').service('RuleService', function(DefaultPropsFac, SupportService){
  //contains all rules in the current project.
  var rulesList = [];
  //contains all types of rules curently available to the project.
  var generalRuleList = [];
  var booleanRuleList = [];
  var knowledgeRuleList = [];
  DefaultPropsFac.LoadRules().then(function(data){
    generalRuleList = data.general;
    booleanRuleList = data.boolean;
    knowledgeRuleList = data.knowledge;
    for(var r in generalRuleList)
    {
      generalRuleList[r].properties = SupportService.matchtypes(generalRuleList[r].properties);
    }
  });

  this.setRules = function(rules){
    rulesList = rules;
  }

  this.getRules = function(){
    return rulesList;
  }

  this.getRuleTypeList = function(){
    return generalRuleList;
  };

  this.getBooleanTypeList = function(){
    return booleanRuleList;
  };

  this.getKnowledgeTypeList = function(){
    return knowledgeRuleList;
  };

  this.getRule = function(name){
    for(var r in generalRuleList){
      if(generalRuleList[r].name == name){
        return generalRuleList[r];
      }
    }
    for(var r in booleanRuleList){
      if(booleanRuleList[r].name == name){
        return booleanRuleList[r];
      }
    }
    for(var r in knowledgeRuleList){
      if(knowledgeRuleList[r].name == name){
        return knowledgeRuleList[r];
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
  this.addRule = function(source, target, rule, def, cat){
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

    if(SupportService.contains(newId,"id",rulesList)>-1)
    {
      dupe = true;
    }
    if(source!=="" && !dupe)
    {
      var newrule = {id: newId.id, sourceId: source.id, source:source, targetId: target.id, target: target, name: rule.name, defaultRule:def, category: cat };
      //adds rule properties to the topic parameters. Sets the item to a rule parameter if it already exists (so the user cannot delete it).
      if(cat=="general"){
        ruleIndex = SupportService.contains(newrule,"name",generalRuleList);
        if(ruleIndex != -1){
          ruledef = generalRuleList[ruleIndex];
        }
      }
      if(cat=="suitability" | cat == "availability"){
        ruleIndex = SupportService.contains(newrule,"name",booleanRuleList);
        if(ruleIndex != -1){
          ruledef = booleanRuleList[ruleIndex];
        }
      }
      if(cat=="knowledge"){
        ruleIndex = SupportService.contains(newrule,"name",knowledgeRuleList);
        if(ruleIndex != -1){
          ruledef = knowledgeRuleList[ruleIndex];
        }
      }
      rulesList.push(newrule);
      return ruledef.properties;
    }
  };

  this.getRuleCat = function(rule){
    if(SupportService.contains(rule, "name", generalRuleList)>-1){
      return "general";
    }
    if(SupportService.contains(rule, "name", booleanRuleList)>-1){
      return "boolean";
    }
    if(SupportService.contains(rule, "name", knowledgeRuleList)>-1){
      return "knowledge";
    }

  }

  this.removeRule = function(ruleId){
    for(var r in rulesList){
      if(rulesList[r].id == ruleId){
        rulesList.splice(r,1);
      }
    };
  }
});
