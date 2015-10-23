<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once("dataconnect.php");
require_once("deployment.php");
$database = new database();
$deployer = new deployer();

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
if(isset($_GET['action']) and $_GET['action'] == "saveProject")
{
  echo $database->saveProject($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "deleteProject"){
  echo $database->deleteProject($_GET);
  exit;
}
if(isset($_GET['action']) and $_GET['action'] == "deploy"){
  echo $deployer->deploy($_GET);
  exit;
}
?>
