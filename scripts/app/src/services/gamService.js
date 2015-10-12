//This controller is all about generating the GAM code based on the current model.
angular.module('modelbuilder').service('GamService', function($window, $http, RuleService, ConceptService, SupportService, DeploymentFactory, SessionService) {
    this.generateGAM = function(){
        coursemodel = ConceptService.getConcepts();
        rulesList = RuleService.getRuleTypeList();
        defaultTypes = ConceptService.getConceptTypes();
        usedTypes = [];
        for(var c in coursemodel){
          if(SupportService.contains(coursemodel[c].type,"",usedTypes)==-1){
            usedTypes.push(coursemodel[c].type);
          }
        }
        //First Print the templated concepts of which other concepts will inherit behaviour
        var output = '$options { default.properties "event;strict"} \n \n';
        for(var i in defaultTypes){
          if(SupportService.contains(defaultTypes[i].name,"",usedTypes)!=-1){
            var concept = "";
            concept += defaultTypes[i].name.replace(/\s+/g, '') + "{\n";
            for(var p in defaultTypes[i].default_parameters){
                concept+="\t#["+ defaultTypes[i].default_parameters[p].name +"]:"+defaultTypes[i].default_parameters[p].type+" `"+defaultTypes[i].default_parameters[p].value + "`\n";
            }

            var suitability = "\t#suitability:Boolean =`true";
            var availability = "\t#availability:Boolean =`true";
            var knowledge = "\t#knowledge:Double =`";
            var hasKnowledgeRule = false;
            //add general template rules
            for(var r in defaultTypes[i].default_general_rules){
              rule = RuleService.getRule(defaultTypes[i].default_general_rules[r]);
                  if(rule.type=="unary"){
                      concept += "\t" + rule.code + "\n";
                  }
            }
            //add knowledge template rules
            for(var r in defaultTypes[i].default_knowledge_rules){
              rule = RuleService.getRule(defaultTypes[i].default_knowledge_rules[r]);
                  if(rule.type=="unary"){
                      hasKnowledgeRule = true;
                      knowledge += rule.code;
                  }
            }
            //add availability template rules
            for(var r in defaultTypes[i].default_availability_rules){
              rule = RuleService.getRule(defaultTypes[i].default_availability_rules[r]);
                  if(rule.type=="unary"){
                      availability +=  " && "+ rule.code;
                  }
            }
            //add suitability template rules
            for(var r in defaultTypes[i].default_suitability_rules){
              rule = RuleService.getRule(defaultTypes[i].default_suitability_rules[r]);
                  if(rule.type=="unary"){
                      suitability +=  " && "+ rule.code;
                  } " && "+ code;
            }
          if(!hasKnowledgeRule){
            knowledge += "0";
          }
          concept += knowledge +"`\n"+ availability +"`\n"+ suitability +"`\n } \n \n";
          output += concept;
        }
      }

        //Output all concepts extending the basic types
        for(var i in coursemodel)
        {
          if(coursemodel[i].selected==true)
          {
            var concept = "";
            concept += coursemodel[i].text.replace(/\s|'|"|`/g, '') + "{\n";
            concept += "\t->(extends)"+ coursemodel[i].type.replace(/\s+/g, '') + "\n";
            concept += "\ttitle `" + coursemodel[i].description + "`\n";
            for(var j in coursemodel)
            {
              if (coursemodel[j].id == coursemodel[i].parent)
              {
                  concept += "\t->(parent)"+coursemodel[j].text.replace(/\s+/g, '')+"\n";
              }
            }
            for(var p in coursemodel[i].parameters)
            {
              if(coursemodel[i].parameters[p].defval == null | coursemodel[i].parameters[p].value != coursemodel[i].parameters[p].defval && coursemodel[i].parameters[p].defval!="")
              {
                concept+="\t#["+ coursemodel[i].parameters[p].name +"]:"+coursemodel[i].parameters[p].type+" `"+coursemodel[i].parameters[p].value + "`\n";
              }
            }
            resource = "placeholder.xhtml";
            if(coursemodel[i].resource!=""){
              resource = coursemodel[i].resource;
            }
            concept += '\t#content:String =`~ return "[[='+resource +']]";`\n';
            concept += '\t#resource =`~ return "[[=layout.xhtml]]";`\n';
            itemRules = RuleService.getItemRules(coursemodel[i].id);
            var general = "";
            var suitability = "\t#suitability:Boolean =`true";
            var suitHasNonDefRules = false;
            var availability = "\t#availability:Boolean =`true";
            var availHasNonDefRules = false;
            var knowledge = "";
            var knowlegdeHasNonDefRule = false;
            for(var r in itemRules)
            {
              if(itemRules[r].source.id == coursemodel[i].id){
                ruleDef = RuleService.getRule(itemRules[r].name);
                var code = "";
                if(ruleDef.type == "unary"){
                  code = ruleDef.code;
                }
                if(ruleDef.type == "binary"){
                  var rulecode = RuleService.getRule(itemRules[r].name).code;
                  code = rulecode.replace("%target%",itemRules[r].target.text.replace(/\s|'|"|`/g, ''));
                }
                if(itemRules[r].category == "general" && itemRules[r].defaultRule == false){
                  general += "\t" + code + "\n";
                }
                if(itemRules[r].category =="suitability"){
                  if(itemRules[r].defaultRule == false){
                    suitHasNonDefRules = true;
                  }
                  suitability += " && "+ code;
                }
                if(itemRules[r].category=="availability"){
                  if(itemRules[r].defaultRule == false){
                    availHasNonDefRules = true;
                  }
                  availability += " && "+ code;
                }
                if(itemRules[r].category=="knowledge" && itemRules[r].defaultRule == false){
                  if(knowledge ==""){
                  knowledge = "\t#knowledge:Double =`"
                  }
                  knowlegdeHasNonDefRule = true;
                  knowledge += code;
                }
              }
            }
            suitability += "` \n";
            availability += "` \n";
            if(knowlegdeHasNonDefRule){
              knowledge += "` \n";
            }
            if(suitHasNonDefRules){
              concept += suitability;
            }
            if(availHasNonDefRules){
              concept += availability;
            }
            concept += knowledge + general;
            concept+= "} \n \n";
            output += concept;
          }
        }
        //To just view the file use:
        //window.open('data:text,' + encodeURIComponent(output));
        //To actually deploy:
        DeploymentFactory.deploy(SessionService.getCurrentproject().name,output)
    };
});
