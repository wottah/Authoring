//This controller is all about generating the GAM code based on the current model.
angular.module('modelbuilder').service('GamService', function($window, $http, RuleService, ConceptService) {
    this.generateGAM = function(){
        coursemodel = ConceptService.getConcepts();
        defaultTypes = ConceptService.getConceptTypes();
        rulesList = RuleService.getRuleTypeList();

        //First Print the templated concepts of which other concepts will inherit behaviour
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

        //Output all concepts extending the basic types
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
                  concept += "\t->(parent)"+coursemodel[j].text+"\n";
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
            var general = "\t";
            var suitability = "\t#suitability:Boolean =`true";
            var availability = "\t#availability:Boolean =`true";
            var knowledge = "\t#knowledge:Double =`";
            for(var r in itemRules)
            {
              if(itemRules[r].defaultRule == false && itemRules[r].source.id == coursemodel[i].id){
                ruleDef = RuleService.getRule(itemRules[r].name);
                var code = "";
                if(ruleDef.type == "unary"){
                  code = ruleDef.code;
                }
                if(ruleDef.type == "binary"){
                  var rulecode = RuleService.getRule(itemRules[r].name).code;
                  code = rulecode.replace("%target%",itemRules[r].target.text);
                }
                if(itemRules[r].category == "general"){
                  general += code + "\n";
                }
                if(itemRules[r].category =="suitability"){
                  suitability += " && "+ code;
                }
                if(itemRules[r].category=="availability"){
                  availability += " && "+ code;
                }
                if(itemRules[r].category=="knowledge"){
                  knowledge += code;
                }
              }
            }
            suitability += "` \n";
            availability += "` \n";
            knowledge += "` \n";
            concept += suitability + availability + knowledge + general;
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
