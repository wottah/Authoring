//This controller is all about generating the GAM code based on the current model.
angular.module('modelbuilder').service('GamService', function($window, $http, RuleService, ConceptService, SupportService, DeploymentFactory, SessionService) {
    this.generateGAM = function(){
        coursemodel = ConceptService.getConcepts();
        rulesList = RuleService.getRuleTypeList();
        defaultTypes = ConceptService.getConceptTypes();
        defaultPersRules = RuleService.getPersistentTypeList();
        defaultAttRules = RuleService.getAttRuleTypeList();
        defaultTemplateAttRules = [];
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

            var defaultAttributes = ConceptService.getDefaultAtts();
            //add template rules
            for(var r in defaultTypes[i].default_rules){
              rule = RuleService.getRule(defaultTypes[i].default_rules[r]);
              if(rule.properties!=null){
                if(rule.type=="unary"){
                    concept += "\t" + rule.code + "\n";
                }
              }
              if(rule.target!=null){
                //get target attribute
                for(var index in defaultAttributes){
                  if(defaultAttributes[index].name == rule.target){
                    this.addAttrCode(defaultAttributes[index], rule.code);
                }
              }
            }
          }
          //add all attribute code to the concept.
          for(var t in defaultAttributes){
            if(defaultAttributes[t].code == null){
              concept += "\t#"+defaultAttributes[t].name+":"+defaultAttributes[t].type+" =`"+defaultAttributes[t].value+"`\n";
              defaultTemplateAttRules.push({id:defaultTypes[i].name + defaultAttributes[t].name, type: defaultAttributes[t].type, code:defaultAttributes[t].value});
            }
            else{
              concept += "\t#"+defaultAttributes[t].name+":"+defaultAttributes[t].type+" =`"+defaultAttributes[t].code+"`\n";
              defaultTemplateAttRules.push({id:defaultTypes[i].name + defaultAttributes[t].name, type: defaultAttributes[t].type, code:defaultAttributes[t].code});
            }
          }
          output += concept + "}\n\n";
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
            defaultAttributes = [];
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
            for(var r in itemRules)
            {
              if(itemRules[r].source.id == coursemodel[i].id && itemRules[r].defaultRule==false){
                ruleDef = RuleService.getRule(itemRules[r].name);
                var code = "";
                  if(ruleDef.type == "unary"){
                    code = ruleDef.code;
                  }
                  if(ruleDef.type == "binary"){
                    var rulecode = RuleService.getRule(itemRules[r].name).code;
                    code = rulecode.replace("%target%",itemRules[r].target.text.replace(/\s|'|"|`/g, ''));
                  }
                if(ruleDef.target!=null)
                {
                  newatt = true;
                  for(var r in defaultAttributes){
                    if(ruleDef.target == defaultAttributes[r].name){
                      this.addAttrCode(defaultAttributes[r], code);
                      newatt = false;
                    }
                  }
                  if(newatt){
                    //add de attribute in de lijst.
                    alert("newatt");
                    for(var a in defaultTemplateAttRules){
                      if(defaultTemplateAttRules[a].id == coursemodel[i].type + ruleDef.target){
                        atrObject = {name: ruleDef.target, type:defaultTemplateAttRules[a].type, code: defaultTemplateAttRules[a].code};
                        alert(code);
                        this.addAttrCode(atrObject, code);
                        defaultAttributes.push(atrObject);
                      }
                    }
                  }
                }
                //voeg regelcode toe aan concept als t geen attributecode is
                if(ruleDef.parameters!=null){
                  concept += "\t"+code+"\n";
                }
              }
            }
            //add all attribute code to the concept.
            for(var t in defaultAttributes){
                concept += "\t#"+defaultAttributes[t].name+":"+defaultAttributes[t].type+" =`"+defaultAttributes[t].code+"`\n";
            }
            concept+= "} \n \n";
            output += concept;
          }
        }
        //To just view the file use:
        //window.open('data:text,' + encodeURIComponent(output));
        //To actually deploy:
        DeploymentFactory.deploy(SessionService.getCurrentproject().name,output)
    };

    this.addAttrCode = function(attribute, code){
      //determine what to apply by evaluating the attribute type:
      if(attribute.type=="String"){
        if(attribute.code == null){
          attribute.code = "";
        }
        attribute.code += code;
      }
      if(attribute.type=="Boolean"){
        if(attribute.code == null){
          attribute.code = "true ";
        }
        attribute.code += " && "+ code;
      }
      if(attribute.type=="Integer" || attribute.type=="Double"){
        if(attribute.code == null){
          attribute.code = rule.code;
        }
        else{
            attribute.code += " + " + code;
        }
      }
    };
});
