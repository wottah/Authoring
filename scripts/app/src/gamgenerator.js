//This controller is all about generating the GAM code based on the current model.
angular.module('modelbuilder').controller('GamController', function($window, $http, RuleService, ConceptService) {
    this.generateGAM = function(coursemodel){
        defaultTypes = ConceptService.getConceptTypes();
        rulesList = RuleService.getRuleTypeList();

        var output = "";
        for(var i in defaultTypes)
        {
          var concept = "";
          concept += defaultTypes[i].name + "{\n";
          for(var p in defaultTypes[i].default_parameters){
              concept+="\t#["+ defaultTypes[i].default_parameters[p].name +"]:"+defaultTypes[i].default_parameters[p].type+" `"+defaultTypes[i].default_parameters[p].value + "`\n";
          }
          for(var r in defaultTypes[i].default_rules){
            rule = RuleService.getRule(defaultTypes[i].default_rules[r]);
                if(rule.type=="unary"){
                    concept += "\t" + rule.code + "\n";
                }
          }
        concept+= "} \n \n";
        output += concept;
        }
        for(var i in coursemodel)
        {
          if(coursemodel[i].selected==true)
          {
            var concept = "";
            concept += coursemodel[i].text + "{\n";
            concept += "\t->(extends) "+ coursemodel[i].type + "\n";
            concept += "\ttitle `" + coursemodel[i].description + "`\n";
            for(var j in coursemodel)
            {
              if (coursemodel[j].id == coursemodel[i].parent)
              {
                  concept += "\t<-(parent)"+coursemodel[j].text+"\n";
              }
            }
            for(var p in coursemodel[i].parameters)
            {
              if(coursemodel[i].parameters[p].defval == null | coursemodel[i].parameters[p].value != coursemodel[i].parameters[p].defval && coursemodel[i].parameters[p].defval!="")
              {
                concept+="\t#["+ coursemodel[i].parameters[p].name +"]:"+coursemodel[i].parameters[p].type+" `"+coursemodel[i].parameters[p].value + "`\n";
              }
            }
            concept += "\t#resource =`"+ coursemodel[i].resource +"`\n";
            itemRules = RuleService.getItemRules(coursemodel[i].id);
            for(var r in itemRules)
            {
              if(itemRules[r].defaultRule == false && itemRules[r].source.id == coursemodel[i].id){
                ruleDef = RuleService.getRule(itemRules[r].name);
                if(ruleDef.type == "unary"){
                  concept += "\t" + ruleDef.code + "\n";
                }
                if(ruleDef.type == "binary"){
                  var rulecode = RuleService.getRule(itemRules[r].name).code;
                  rulecode = rulecode.replace("%target%",itemRules[r].target.text);
                  concept += "\t" + rulecode + "\n";
                }
              }
            }
            concept+= "} \n \n";
            output += concept;
          }
        }
        newTab = $window.open();
        newTab.document.open();
        newTab.document.write("<pre>"+output+"</pre>");
        newTab.document.close();
    };
});
