The system relies on a combination of technologies for its functionality. We've utilized JavaScript, HTML, and CSS for the front-end development, while MySQL serves as the backbone for the database management. To establish seamless communication between the database and front-end interface, we've leveraged the power of JavaScript, particularly through Node.js, which facilitates efficient connections and data handling. This Housing Application is designed to streamline the process of finding, listing, and managing properties for rent or sale. It serves as a centralised platform for property seekers, and brokers to interact and conduct real estate transactions with ease.

User : Property Seeker Property Broker

Technologies Used : Frontend: HTML, CSS, JavaScript Backend: Node.js, JavaScript Database: MySQL

Steps to Run the Application on your system:

Have all the files related to the project in a single folder. We have provided the zip of all the required files.

Create schema of boston_housing_project using the data dump or manually creating the schema using the project_dbms.sql file. Use MySQL workbench as we are woking on SQL. Then, to have all the procedures, functions, triggers and events build on the schema use project_procedure_functions.sql file and run it. Or the data dump will include all the schema, insert data and procedures, functions dumped as well so you can run that itself.

The sample data that is insert statements for area, crime, university and related tables are also provided in the project_dbms.sql file itself.

If node is not installed then firstly install node.js These are the links that might help you in installation https://nodejs.org/en/learn/getting-started/how-to-install-nodejs . link for installation : https://nodejs.org/en/download

Now, after successful installation of node.js, install vs code if you donot have it installed. These are the links that might help you in installation : https://code.visualstudio.com/download

Now, open the project in vs code, open terminal in vs code and go to the Backend folder in the dbms project folder through the terminal. Now enter the command npm init. This will help in generating the package.json file.

After package.json file has been created then type npm install to install the required packages. This is also required to be done in Backend folder terminal itself.
6.Then, enter the command node server.js and username and password of your MySQL workbench to connect the database. So type, node server.js username password , in the same package’s command prompt. Entering the correct password and username will give you connected to database message or else connect will be failed and you will have to enter node server.js with correct username and password with argument lines. Eg: if username is root and password is 1234 then, type node server.js root 1234

Then go to the Frontend folder and open index.html directly by clicking it, this will open the sign up page and then you can access the application through this page by signing up, logging in and moving further in the application.
The server.js has database name as boston_housing_project so make sure you have created this project schema in your database. And the localhost is used as the server.
