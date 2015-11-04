<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once("dataconnect.php");
require_once("fileconnect.php");
$database = new database();
$fileManager = new fileManager();

if(isset($_GET['action']) and $_GET['action'] == "login")
{
    echo $database->login($_GET);
    exit;
}
if(isset($_GET['action']) and $_GET['action'] == "register"){
  echo $database->registerUser($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "getProjects")
{
  echo $database->getProjects($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "newProject")
{
  echo $database->saveProject($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "saveProject")
{
  echo $fileManager->saveFile($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "loadProject")
{
  echo $fileManager->loadFile($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "deleteProject"){
  echo $database->deleteProject($_GET);
  echo $fileManager->deleteFile($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "deploy"){
  echo $fileManager->deploy($_GET);
  exit;
}
?>
