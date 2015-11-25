This is a step-by-step tutorial on how to get the GALE authoring tool to run on your machine locally.
The version of the tool this guide is written for is the commit last made at Nov 17, 2015. The repository can be reached at: https://github.com/wottah/Authoring/

 1. Install a web server of your choice, make  sure php is installed on this server. A WAMP stack is recommended when using windows, as all components required are present out of the box.
    The tool is tested and first deployed using Bitnami (https://bitnami.com/stack/wamp).
 2. Install MySQL on your machine.
 3. Deploy the source to the webserver.
 4. Change the base tag to match the server directory in which the project is located. If the project is located in your server root folder, it should remain the same.
    Otherwise set it to the path at which the project folder is located.
 5. Open src/data/dataconnect.php and make sure the constants declared at the top of this file match your database server location and port.
 6. Make sure the user/password combination in dataconnect.php is set to an existing database user with the rights to:SELECT, UPDATE, INSERT and DELETE data, as well as to CREATE structures.
 7. open src/data/fileconnect.php. GALELOC is the location of the folder in which authored projects will be deployed. PROJDIR is the folder in which your projects will be saved. Set these file locations as desired.
 8. when this is done start the server and try to visit localhost/testsite/. 'localhost' should be the address of the server the tool is deployed on.
 9. Happy authoring!
