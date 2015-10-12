<?php
  class deployer {
    //CODE TO save concepts file n the gale server.
    const GALELOC = "C:/tomcat/apache-tomcat-7.0.55/webapps/authoringProjects";

    public function deploy($data){
      $post = json_decode(file_get_contents("php://input"));
      $name = $post->name;
      $content = $post->content;
      $savedir = self::GALELOC . "/" . $name;
      if(file_exists($savedir)){
        //edit the existing concepts file.
        $projectFile = fopen($savedir . "/concepts.gam", "w") or die("Unable to open file!");
        fwrite($projectFile,$content);
        fclose($projectFile);
      }
      else{
        //create project dir and concepts file.
        mkdir($savedir, 0777, true) or die("Unable to create directory!");
        $projectFile = fopen($savedir . "/concepts.gam", "w") or die("Unable to open file!");
        fwrite($projectFile,$content);
        fclose($projectFile);
      }
    }


  }
 ?>
