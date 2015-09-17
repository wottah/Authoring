<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once("dataconnect.php");
$database = new database();

if(isset($_GET['action']) and $_GET['action'] == "login")
{
    echo $database->login($_GET);
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
?>
