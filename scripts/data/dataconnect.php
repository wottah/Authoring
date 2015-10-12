<?php
  class db {
    //CODE TO CONNECT TO DB AND PERFORM OPERATIONS
    const SERVER = "localhost:3306";
    const USER = "author";
    const PASS = "author";
    const DB = "authoringbase";

    private static $instance = NULL;


    public function getConnection(){
      $connection = new mysqli(self::SERVER, self::USER, self::PASS, self::DB);
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
      $query = $this->connection->prepare("SELECT author, name, data, description
                                            FROM projects
                                            WHERE author = ?");
      $query->bind_param('s',$username);
      $query->execute();
      $query->bind_result($author, $name, $data, $description);
      while($query->fetch())
      {
        $returnobj = array('author' => $author, 'name' => $name, 'data' => $data, 'description' => $description);
        array_push($returnlist,$returnobj);
      }

      return json_encode($returnlist);
    }

    public function deleteProject($data)
    {
      $post = json_decode(file_get_contents("php://input"));
      $author = $this->connection->real_escape_string($post->user);
      $name = $this->connection->real_escape_string($post->name);
      $query = $this->connection->prepare("DELETE FROM projects
                                            WHERE author = ? AND name = ?");
      $query->bind_param('ss', $author, $name);
      $result = $query->execute();
      return $result;
    }

    public function saveProject($data)
    {
      $post = json_decode(file_get_contents("php://input"));
      $author = $this->connection->real_escape_string($post->user);
      $name = $this->connection->real_escape_string($post->name);
      $description = $this->connection->real_escape_string($post->description);
      //escaping the data would destroy the JSON structure
      $data = $post->data;
      $query = $this->connection->prepare("INSERT INTO projects (author, name, description, data)
                                            VALUES (?,?,?,?)
                                            ON DUPLICATE KEY
                                            UPDATE description = ?, data = ?");
      $query->bind_param('ssssss',$author, $name, $description, $data, $description, $data);
      $result = $query->execute();
      return $result;
    }
  }
 ?>
