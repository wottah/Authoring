<?php
  class db {
    //CODE TO CONNECT TO DB AND PERFORM OPERATIONS
    const SERVER = "localhost";
    const USER = "author";
    const PASS = "author";
    const DB = "authoringbase";
    const PORT = 3306;

    private static $instance = NULL;

    public function getConnection(){
      $connectioncheck = new mysqli(self::SERVER, self::USER, self::PASS,"",self::PORT);
      if ($connectioncheck->connect_errno) {
      echo "Failed to connect to MySQL: (" . $connectioncheck->connect_errno . ") " . $connectioncheck->connect_error;
      }
      $exists = true;
      $query = $connectioncheck->prepare("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='" . self::DB . "'");
      $query->execute();
      $query->bind_result($exists);
      $query->fetch();
      $connectioncheck->close();
      if(!$exists){
        //create and connect to db.
        $connectionCreateDb = new mysqli(self::SERVER, self::USER, self::PASS,"",self::PORT);
        if ($connectionCreateDb->connect_errno) {
        echo "Failed to connect to MySQL: (" . $connectionCreateDb->connect_errno . ") " . $connectionCreateDb->connect_error;
        }
        $query = $connectionCreateDb->prepare("CREATE DATABASE ". self::DB);
        $query->execute();
        $connectionCreateDb->close();
        $connectionCreateTables = new mysqli(self::SERVER, self::USER, self::PASS, self::DB, self::PORT);
        if ($connectionCreateTables->connect_errno) {
        echo "Failed to connect to MySQL: (" . $connectionCreateTables->connect_errno . ") " . $connectionCreateTables->connect_error;
        }
        $query = $connectionCreateTables->prepare("CREATE TABLE users (
                                                          ID INT(3) UNSIGNED AUTO_INCREMENT,
                                                          username VARCHAR(25) NOT NULL PRIMARY KEY,
                                                          password VARCHAR(25) NOT NULL
															                    );
                                                  CREATE TABLE projects (
                                                             author VARCHAR(255) NOT NULL,
                                                             name VARCHAR(255) NOT NULL,
                                                             description VARCHAR(255) NOT NULL,
                                                      		 CONSTRAINT pk_projects PRIMARY KEY (author, name)
                                                  );
                                               ");
        $query->execute();
      }
      $connection = new mysqli(self::SERVER, self::USER, self::PASS, self::DB, self::PORT);
      if ($connection->connect_errno) {
      echo "Failed to connect to MySQL: (" . $connection->connect_errno . ") " . $connection->connect_error;
      }
      return $connection;
    }


    private function __clone(){
    // to avoid cloning this class
    }

    // Secure way to create Database Connection through SINGLETON Model
    protected static function dbInstance(){
    if(NULL == self::$instance){
    self::$instance = new self;
    }
    return self::$instance;
    }
    }

    class database extends db {
    private $connection;

    public function __construct(){
      parent::dbInstance();
      $this->connection = parent::getConnection();
    }

    public function login($post)
    {
      $username = $this->connection->real_escape_string($post['user']);
      $password = $this->connection->real_escape_string($post['pass']);
      $authorised = false;
      $query = $this->connection->prepare("SELECT EXISTS(SELECT  *
                                          FROM users
                                          WHERE username = ?
                                          AND password = ? )");
      $query->bind_param('ss',$username,$password);
      $query->execute();
      $query->bind_result($authorised);
      $query->fetch();
      return $authorised;
    }

    public function getProjects($post)
    {
      $returnlist = [];
      $username = $this->connection->real_escape_string($post['user']);
      $query = $this->connection->prepare("SELECT author, name, description
                                            FROM projects
                                            WHERE author = ?");
      $query->bind_param('s',$username);
      $query->execute();
      $query->bind_result($author, $name, $description);
      while($query->fetch())
      {
        $returnobj = array('author' => $author, 'name' => $name, 'description' => $description);
        array_push($returnlist,$returnobj);
      }

      return json_encode($returnlist);
    }

    public function registerUser($data)
    {
      $post = json_decode(file_get_contents("php://input"));
      $name = $this->connection->real_escape_string($post->name);
      $pass = $this->connection->real_escape_string($post->pass);
      $success = false;
      $query = $this->connection->prepare("INSERT INTO users (username,password)
                                          VALUES (?,?) ");
      $query->bind_param('ss',$name,$pass);
      $success = $query->execute();
      return $success;
    }

    public function deleteProject($data)
    {
      $author = $this->connection->real_escape_string($data['user']);
      $name = $this->connection->real_escape_string($data['name']);
      $query = $this->connection->prepare("DELETE FROM projects
                                            WHERE author = ? AND name = ?");
      $query->bind_param('ss', $author, $name);
      $result = $query->execute();
      return $result;
    }

    public function saveProject($data)
    {
      $author = $this->connection->real_escape_string($data['user']);
      $name = $this->connection->real_escape_string($data['name']);
      $description = $this->connection->real_escape_string($data['description']);
      $query = $this->connection->prepare("INSERT INTO projects (author, name, description)
                                            VALUES (?,?,?)
                                            ON DUPLICATE KEY
                                            UPDATE description = ?");
      $query->bind_param('ssss',$author, $name, $description, $description);
      $result = $query->execute();
      return $result;
    }
  }
 ?>
