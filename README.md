###Boston Housing Web Application

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

###TOP LEVEL DESCRIPTION OF PROJECT

In this project we aim to develop a comprehensive real estate management
system mainly for the students community of Boston.

This system facilitates the buying, renting and selling of properties by property
seeker and property broker/contact. The users can register to the platform as
a property contact or a property seeker.

The platform provides property seekers with a platform to search for
properties based on various criteria such as area, near a university, price,
number of bedrooms , bathrooms, and property type.

User can also request view of property, give reviews to a property, and apply for
buying/rent once they have been approved of their request.
Also, they can additionally, view an area details like amenities, crimes in an area,
property amenities.

The broker / property contact lists the property details along with the amenities.
The brokers or the property contact person contacts the property seeker
(buyer/renter) for further inquiries after the request to view property has been
made by the property seeker. Property seeker lets the broker know the intent of
buying/renting the property after viewing of property is complete. Also the broker
marks the request to view is complete.

Users can also leave reviews for properties.
Brokers can manage the listing of property based on the property being bought or
rented by a property seeker or is still available, which implies the property contact
can update and delete any property from the list of properties.

Here, we consider a system where brokers are working under a house leasing and
selling firm, where any broker is assigned to list properties, any broker is similarly
assigned by the firm to update property details or delete property from the listings.
So, there is no relation required between a broker and property. As, brokers work to
add , update, delete the properties and are associated to complete request related
to property viewing that is assigned to them based on the number of clients with a
broker.

The property contact handles the request of a property seeker. Broker also
accepts the requests of property seeker who applied for property viewing, note
the intent of seeker and accept or reject the request of buying or renting a
property.

The property details such as buying date, or leasing start date end date, rent,
lease tenure , are also monitored once a property has been bought or rented
by the property seeker. The property seeker and property contact (broker) can
do all these operations using the website.

###Contributing
welcome contributions to the project! Please follow these guidelines:

Fork the repository
Create a new branch for your feature or bug fix
Make your changes and commit them
Open a pull request
For detailed contributing guidelines, refer to the CONTRIBUTING.md file.

###License
This project is licensed under the MIT License - see the LICENSE file for details.
