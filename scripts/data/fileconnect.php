<?php
  class fileManager {
    //CODE TO save concepts file n the gale server.
    //location of the exported ALAT projects.
    const GALELOC = "C:/tomcat/apache-tomcat-7.0.55/webapps/authoringProjects";
    //location at which the exported ALAT projects are available.
    const PROJURL = "http://localhost:8080/authoringProjects";
    //location of the saved ALAT projects.
    const PROJDIR = "C:/Bitnami/wampstack-5.5.28-0/apache2/htdocs/savedata";
    //location of the placeholder and layout files.
    const DEFAULTPAGDIR = "C:/Bitnami/wampstack-5.5.28-0/apache2/htdocs/defaultfiles";
    //Base URL to start GALE applications.
    const GALEURL = "http://localhost:8080/gale/concept";

    public function deploy($data){
      $post = json_decode(file_get_contents("php://input"));
      $projname = $post->projectname;
      $username = $post->username;
      $content = $post->content;
      $projectfolder = $projname . "_" . $username;
      $savedir = self::GALELOC . "/" . $projectfolder;
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
        copy(self::DEFAULTPAGDIR . "/layout.xhtml",$savedir . "/layout.xhtml" );
        copy(self::DEFAULTPAGDIR . "/placeholder.xhtml",$savedir . "/placeholder.xhtml");
      }
      return self::GALEURL . "/" . self::PROJURL . "/" . $projectfolder . "/";
    }

    public function saveFile($data){
      $post = json_decode(file_get_contents("php://input"));
      $name = $post->name;
      $content = $post->data;
      $savedir = self::PROJDIR . "/" . $name . ".json";
      if(file_exists($savedir)){
        //edit the existing concepts file.
        $projectFile = fopen($savedir, "w") or die("Unable to open file!");
        fwrite($projectFile,$content);
        fclose($projectFile);
      }
      else{
        //create project dir and concepts file.
        $projectFile = fopen($savedir, "w") or die("Unable to open file!");
        fwrite($projectFile,$content);
        fclose($projectFile);
      }
    }

    public function loadFile($data){
      $loadDir = self::PROJDIR . "/" . $data['name'] . ".json";
      if(file_exists($loadDir)){
        $json = file_get_contents($loadDir);
        return $json;
      }
      else{
        //file is not found.
        return "FileNotFound";
      }
    }

    public function deleteFile($data){
      $deleteDir = self::PROJDIR . "/" . $data['user'] . $data['name'] .".json";
      if(file_exists($deleteDir)){
        unlink($deleteDir) or die("Unable to delete file!");
        return true;
      }
      return false;
    }
  }
 ?>
