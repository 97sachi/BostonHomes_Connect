use boston_housing_project; 

-- procedure for signup of user 

DELIMITER $$

CREATE PROCEDURE Insert_User(
    IN p_username VARCHAR(60),
    IN p_user_password VARCHAR(25),
    IN p_email VARCHAR(55),
    IN p_contact INT,
    IN p_person_name VARCHAR(60)
)
BEGIN
    DECLARE duplicate_username INT;
    
    -- Check if the username already exists
    SELECT COUNT(*) INTO duplicate_username FROM registered_user WHERE username = p_username;
    
    -- If the username already exists, return an error
    IF duplicate_username > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already exists';
    ELSE
        -- Insert the new user
        INSERT INTO registered_user (username, user_password, email, contact, person_name) 
        VALUES (p_username, p_user_password, p_email, p_contact, p_person_name);
    END IF;
    
END$$

DELIMITER ;

-- logged in user can enter password to login , function for that

DELIMITER $$

CREATE FUNCTION Validate_User_Login(
    p_username VARCHAR(60),
    p_password VARCHAR(25)
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE user_exists INT;
    DECLARE password_match INT;

    -- Check if the username exists
    SELECT COUNT(*) INTO user_exists FROM registered_user WHERE username = p_username;

    -- If username doesn't exist, return 0
    IF user_exists = 0 THEN
        RETURN 0;
    ELSE
        -- Check if the password matches the username
        SELECT COUNT(*) INTO password_match FROM registered_user WHERE username = p_username AND user_password = p_password;
        
        -- If password doesn't match, return -1
        IF password_match = 0 THEN
            RETURN -1;
        ELSE
            RETURN 1; -- Password matches
        END IF;
    END IF;
END$$

DELIMITER ;


-- if user type is broker, add in broker table username and contact_id 

DELIMITER $$

CREATE FUNCTION Insert_Contact_Broker(
    p_username VARCHAR(60)
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE last_contact_id INT;
    DECLARE new_contact_id INT;
    DECLARE user_exists INT;
    
    -- Check if the username exists
    SELECT COUNT(*) INTO user_exists FROM registered_user WHERE username = p_username;
    
    -- If username doesn't exist, return -1
    IF user_exists = 0 THEN
        RETURN -1;
    ELSE
        -- Get the last contact_id to generate the new one
        SELECT MAX(contact_id) INTO last_contact_id FROM property_contact_broker;
        
        -- If no previous entry, start contact_id from 1
        IF last_contact_id IS NULL THEN
            SET new_contact_id = 1;
        ELSE
            SET new_contact_id = last_contact_id + 1;
        END IF;
        
        -- Insert username and contact_id into property_contact_broker table
        INSERT INTO property_contact_broker (contact_id, username) VALUES (new_contact_id, p_username);
        
        -- Return the newly generated contact_id
        RETURN new_contact_id;
    END IF;
END$$

DELIMITER ;

-- similarly, if the user type is property seeker add that in property seeker table

DELIMITER $$

CREATE FUNCTION Insert_Property_Seeker(
    p_username VARCHAR(60)
)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE last_customer_id VARCHAR(20);
    DECLARE new_customer_id VARCHAR(20);
    DECLARE user_exists INT;
    
    -- Check if the username exists
    SELECT COUNT(*) INTO user_exists FROM registered_user WHERE username = p_username;
    
    -- If username doesn't exist, return NULL
    IF user_exists = 0 THEN
        RETURN NULL;
    ELSE
        -- Get the last customer_id to generate the new one
        SELECT MAX(customer_id) INTO last_customer_id FROM property_seeker;
        
        -- If no previous entry, start customer_id from 'cus1'
        IF last_customer_id IS NULL THEN
            SET new_customer_id = 'cus1';
        ELSE
            SET new_customer_id = CONCAT('cus', CAST(SUBSTRING(last_customer_id, 4) + 1 AS CHAR));
        END IF;
        
        -- Insert username and customer_id into property_seeker table
        INSERT INTO property_seeker (customer_id, username) VALUES (new_customer_id, p_username);
        
        -- Return the newly generated customer_id
        RETURN new_customer_id;
    END IF;
END$$

DELIMITER ;

-- adding broker information in property_contact table , updating
DELIMITER $$

CREATE PROCEDURE Insert_Property_Contact_Broker(
    IN p_contact_type ENUM('broker','manager','owner'),
    IN p_information TEXT,
    IN p_username VARCHAR(60)
)
BEGIN
    DECLARE user_exists INT;

    -- Check if the username exists in property_contact_broker table
    SELECT COUNT(*) INTO user_exists FROM property_contact_broker WHERE username = p_username;

    -- If username doesn't exist, raise an error
    IF user_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username does not exist';
    ELSE
        -- Update existing row if the username matches
        UPDATE property_contact_broker 
        SET contact_type = p_contact_type, information = p_information 
        WHERE username = p_username;
    END IF;
END$$

DELIMITER ;

-- function to check if username is property seeker 
DELIMITER $$
CREATE FUNCTION CheckUsernameInPropertySeeker(
    p_username VARCHAR(60)
)
RETURNS INT
deterministic
BEGIN
    DECLARE exists_count INT;
    
    -- Check if the username exists in the property_seeker table
    SELECT COUNT(*) INTO exists_count 
    FROM property_seeker 
    WHERE username = p_username;
    
    -- Return 1 if username exists, otherwise return 0
    RETURN IF(exists_count > 0, 1, 0);
END$$

DELIMITER ;


-- procedure to check if username is present in property broker page 
DELIMITER $$
CREATE FUNCTION CheckUsernameInPropertyContactBroker(
    p_username VARCHAR(60)
)
RETURNS INT
deterministic
BEGIN
    DECLARE exists_count INT;
    
    -- Check if the username exists in the property_contact_broker table
    SELECT COUNT(*) INTO exists_count 
    FROM property_contact_broker 
    WHERE username = p_username;
    
    -- Return 1 if username exists, otherwise return 0
    RETURN IF(exists_count > 0, 1, 0);
END$$
DELIMITER ;

-- function to return customer id based on their username 
DELIMITER $$

CREATE FUNCTION GetCustomerIdByUsername(p_username VARCHAR(60)) 
RETURNS VARCHAR(20)
deterministic
BEGIN
    DECLARE v_customer_id VARCHAR(20);

    -- Check if the username exists in the property_seeker table
    SELECT customer_id INTO v_customer_id
    FROM property_seeker
    WHERE username = p_username;
    
    -- Check if customer_id is NULL, indicating the username does not exist
    IF v_customer_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Username does not exist';
    END IF;
    
    -- Return customer_id if found
    RETURN v_customer_id;
END$$

DELIMITER ;

-- function to get contact id of broker based on username 
DELIMITER $$

CREATE FUNCTION GetContactIdByUsername(p_username VARCHAR(60)) 
RETURNS INT
deterministic
BEGIN
    DECLARE v_contact_id INT;

    -- Check if the username exists in the property_contact_broker table
    SELECT contact_id INTO v_contact_id
    FROM property_contact_broker
    WHERE username = p_username;
    
    -- Check if contact_id is NULL, indicating the username does not exist
    IF v_contact_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Username does not exist';
    END IF;
    
    -- Return contact_id if found
    RETURN v_contact_id;
END$$

DELIMITER ;


-- procedure to add property details in property table 

DELIMITER $$

CREATE PROCEDURE Add_Property_Details(
    IN p_property_id INT,
    IN p_property_type VARCHAR(64),
    IN p_price DECIMAL(10,2),
    IN p_bedrooms INT,
    IN p_bathrooms INT,
    IN p_square_footage DECIMAL(10,2),
    IN p_year_built INT,
    IN p_longitude FLOAT,
    IN p_latitude FLOAT,
    IN p_street_no INT,
    IN p_street_name VARCHAR(64),
    IN p_city VARCHAR(64),
    IN p_zip_code INT,
    IN p_state VARCHAR(64),
    IN p_country VARCHAR(64),
    IN p_rent_buy VARCHAR(20),
    IN p_is_available BOOLEAN,
    IN p_areacode INT,
    IN p_mintenure VARCHAR (50),
    IN p_brokerid INT
)
BEGIN
    DECLARE property_exists INT;
    DECLARE area_exists INT;

    -- Check if the entered property id already exists in the property table
    SELECT COUNT(*) INTO property_exists FROM property WHERE property_id = p_property_id;

    -- If the property id already exists, raise an error
    IF property_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property ID already exists';
    ELSE
        

        -- Check if the entered areacode exists in the area_neighbourhood table
        SELECT COUNT(*) INTO area_exists FROM area_neighbourhood WHERE area_code = p_areacode;

        -- If the areacode does not exist, raise an error
        IF area_exists = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot add property as this area does not exist in our system';
        ELSE
            -- Insert property details into the property table
            INSERT INTO property (property_id, property_type, price, bedrooms, bathrooms, square_footage, year_built, longitude, latitude, street_no, street_name, city, zip_code, state, country, rent_buy, is_available, areacode, min_tenure, listed_broker)
            VALUES (p_property_id, p_property_type, p_price, p_bedrooms, p_bathrooms, p_square_footage, p_year_built, p_longitude, p_latitude, p_street_no, p_street_name, p_city, p_zip_code, p_state, p_country, p_rent_buy, p_is_available, p_areacode, p_mintenure, p_brokerid);
        END IF;
    END IF;
END$$

DELIMITER ;

-- procedure to return list of all the properties listed by the broker
DELIMITER $$

CREATE PROCEDURE List_Properties_By_Broker(
    IN p_broker_id INT
)
BEGIN
    DECLARE property_count INT;

    -- Check if the broker id exists in the property table
    SELECT COUNT(*) INTO property_count FROM property WHERE listed_broker = p_broker_id;

    -- If no properties listed by the broker, return a message
    IF property_count = 0 THEN
        SELECT 'No properties listed by you' AS Message;
    ELSE
        -- Return the properties listed by the broker
        SELECT * FROM property WHERE listed_broker = p_broker_id;
    END IF;
END$$

DELIMITER ;


-- deleting the property from property_ list by broker 

DELIMITER $$

CREATE FUNCTION Delete_Property(
    p_property_id INT,
    p_broker_id INT
)
RETURNS INT
deterministic
BEGIN
    DECLARE v_exists INT;

    -- Check if the property ID and broker ID pair exists in the property table
    SELECT COUNT(*) INTO v_exists
    FROM property
    WHERE property_id = p_property_id AND listed_broker = p_broker_id;

    -- If the pair exists, delete the property and return 0
    IF v_exists > 0 THEN
        DELETE FROM property
        WHERE property_id = p_property_id AND listed_broker = p_broker_id;
        RETURN 0;
    ELSE
        -- If the pair does not exist, return 1
        RETURN 1;
    END IF;
END$$

DELIMITER ;


-- function to update the property list by the broker 
DELIMITER $$

CREATE FUNCTION Update_Property(
    p_property_id INT,
    p_broker_id INT,
    p_property_type VARCHAR(64),
    p_price DECIMAL(10,2),
    p_bedrooms INT,
    p_bathrooms INT,
    p_square_footage DECIMAL(10,2),
    p_year_built INT,
    p_longitude FLOAT,
    p_latitude FLOAT,
    p_street_no INT,
    p_street_name VARCHAR(64),
    p_city VARCHAR(64),
    p_zip_code INT,
    p_state VARCHAR(64),
    p_country VARCHAR(64),
    p_rent_buy VARCHAR(20),
    p_is_available BOOLEAN,
    p_areacode INT,
    p_mintenure VARCHAR(50)
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE property_exists INT;
    
    -- Check if the property ID and broker ID pair exists in the property table
    SELECT COUNT(*) INTO property_exists 
    FROM property 
    WHERE property_id = p_property_id AND listed_broker = p_broker_id;

    -- If the property ID and broker ID pair does not exist, return 0
    IF property_exists = 0 THEN
        RETURN 0;
    ELSE
        -- Update the fields of the property table
        UPDATE property
        SET
            property_type = IFNULL(p_property_type, property_type),
            price = IFNULL(p_price, price),
            bedrooms = IFNULL(p_bedrooms, bedrooms),
            bathrooms = IFNULL(p_bathrooms, bathrooms),
            square_footage = IFNULL(p_square_footage, square_footage),
            year_built = IFNULL(p_year_built, year_built),
            longitude = IFNULL(p_longitude, longitude),
            latitude = IFNULL(p_latitude, latitude),
            street_no = IFNULL(p_street_no, street_no),
            street_name = IFNULL(p_street_name, street_name),
            city = IFNULL(p_city, city),
            zip_code = IFNULL(p_zip_code, zip_code),
            state = IFNULL(p_state, state),
            country = IFNULL(p_country, country),
            rent_buy = IFNULL(p_rent_buy, rent_buy),
            is_available = IFNULL(p_is_available, is_available),
            areacode = IFNULL(p_areacode, areacode),
            min_tenure = IFNULL(p_mintenure, min_tenure)
        WHERE property_id = p_property_id AND listed_broker = p_broker_id;

        -- Return 1 to indicate successful update
        RETURN 1;
    END IF;
END$$

DELIMITER ;

-- trigger to update the area avg price in area table based on entry of that area in property table 
DELIMITER $$

CREATE TRIGGER update_avg_property_price
AFTER INSERT ON property
FOR EACH ROW
BEGIN
    -- Calculate the new average property price for the neighborhood
    DECLARE total_price DECIMAL(10, 2);
    DECLARE property_count INT;
    DECLARE new_avg_price DECIMAL(10, 2);

    -- Get the total price and count of properties in the neighborhood
    SELECT SUM(price), COUNT(*)
    INTO total_price, property_count
    FROM property
    WHERE areacode = new.areacode;

    -- Calculate the new average property price if there are properties in the neighborhood
    IF property_count > 0 THEN
        SET new_avg_price = total_price / property_count;

        -- Update the average property price in the area_neighbourhood table
        UPDATE area_neighbourhood
        SET avg_property_price = new_avg_price
        WHERE area_code = NEW.areacode;
    END IF;
END$$

DELIMITER ;




-- procedure to filter out the properities with type entered by user (apt, flat or such)
DELIMITER $$

CREATE PROCEDURE Show_Properties_By_Type(
    IN p_property_type VARCHAR(64)
)
BEGIN
    DECLARE property_count INT;

    -- Check if the provided property type exists in the property table
    SELECT COUNT(*) INTO property_count FROM property WHERE property_type = p_property_type;

    -- If no properties with the provided type exist, raise an error
    IF property_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No properties with the provided property type exist';
    ELSE
        -- Show all properties with the provided type
        SELECT * FROM property WHERE property_type = p_property_type;
    END IF;
END$$

DELIMITER ;

-- procedure to filter out the properities with price range entered by user , showing properties in that entered range.

DELIMITER $$

CREATE PROCEDURE Show_Properties_By_Price_Range(
    IN p_lower_range DECIMAL(10,2),
    IN p_upper_range DECIMAL(10,2)
)
BEGIN
    DECLARE property_count INT;

    -- Check if any properties exist within the price range
    SELECT COUNT(*) INTO property_count FROM property WHERE price BETWEEN p_lower_range AND p_upper_range;

    -- If no properties exist, raise an error
    IF property_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No properties in this price range';
    ELSE
        -- Show all properties within the price range
        SELECT * FROM property WHERE price BETWEEN p_lower_range AND p_upper_range;
    END IF;
END$$

DELIMITER ;


-- procedure to filter out the properties based on number of bedrooms entered by user

DELIMITER $$

CREATE PROCEDURE Show_Properties_By_Bedrooms(
    IN p_bedrooms INT
)
BEGIN
    DECLARE property_count INT;

    -- Check if any properties exist with the specified number of bedrooms
    SELECT COUNT(*) INTO property_count FROM property WHERE bedrooms = p_bedrooms;

    -- If no properties exist, raise an error
    IF property_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No properties exist with entered number of bedrooms';
    ELSE
        -- Show all properties with the specified number of bedrooms
        SELECT * FROM property WHERE bedrooms = p_bedrooms;
    END IF;
END$$

DELIMITER ;


-- procedure to filter out the properties based on number of bathrooms entered by user
DELIMITER $$

CREATE PROCEDURE Show_Properties_By_Bathrooms(
    IN p_bathrooms INT
)
BEGIN
    DECLARE property_count INT;

    -- Check if any properties exist with the specified number of bathrooms
    SELECT COUNT(*) INTO property_count FROM property WHERE bathrooms = p_bathrooms;

    -- If no properties exist, raise an error
    IF property_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No properties exist with entered number of bathrooms';
    ELSE
        -- Show all properties with the specified number of bathrooms
        SELECT * FROM property WHERE bathrooms = p_bathrooms;
    END IF;
END$$

DELIMITER ;

-- procedure to filter out the properties based on combination of number of bedrooms and bathrooms both 
DELIMITER $$

CREATE PROCEDURE Show_Properties_By_Bedrooms_And_Bathrooms(
    IN p_bedrooms INT,
    IN p_bathrooms INT
)
BEGIN
    DECLARE property_count INT;

    -- Check if any properties exist with the specified number of bedrooms and bathrooms
    SELECT COUNT(*) INTO property_count FROM property WHERE bedrooms = p_bedrooms AND bathrooms = p_bathrooms;

    -- If no properties exist, raise an error
    IF property_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No properties exist with that combination of bedrooms and bathrooms';
    ELSE
        -- Show all properties with the specified number of bedrooms and bathrooms
        SELECT * FROM property WHERE bedrooms = p_bedrooms AND bathrooms = p_bathrooms;
    END IF;
END$$

DELIMITER ;

-- procedure that lists all properites with given area name 
DELIMITER $$

CREATE PROCEDURE Show_Properties_By_Area(
    IN p_area_name VARCHAR(64)
)
BEGIN
    DECLARE area_code_val INT;
    DECLARE area_count INT;

    -- Get the area code for the provided area name
    SELECT area_code INTO area_code_val FROM area_neighbourhood WHERE area_name = p_area_name;

    -- Check if any properties exist in the specified area
    SELECT COUNT(*) INTO area_count FROM property WHERE areacode = area_code_val;

    -- If no properties exist, raise an error
    IF area_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No properties exist in the specified area';
    ELSE
        -- Show all properties in the specified area
        SELECT * FROM property WHERE areacode = area_code_val;
    END IF;
END$$

DELIMITER ;


-- procedure to list all properties as same area code as a university 
DELIMITER $$

CREATE PROCEDURE Show_Properties_By_University(
    IN p_university_name VARCHAR(64)
)
BEGIN
    DECLARE university_area_code INT;
    DECLARE property_count INT;

    -- Get the area code for the provided university name
    SELECT area_code INTO university_area_code FROM university WHERE university_name = p_university_name;

    -- Check if any properties exist in the same area code as the university
    SELECT COUNT(*) INTO property_count FROM property WHERE areacode = university_area_code;

    -- If no properties exist, raise an error
    IF property_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No properties exist in the same area as this university';
    ELSE
        -- Show all properties in the same area as the university
        SELECT * FROM property WHERE areacode = university_area_code;
    END IF;
END$$ 

DELIMITER ;

-- function to validate entered area name exists in the area table .
DELIMITER $$

CREATE FUNCTION Check_Area_Existence(
	p_area_name VARCHAR(64)
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE area_exists INT;

    -- Check if the provided area name exists in the area_neighbourhood table
    SELECT COUNT(*) INTO area_exists FROM area_neighbourhood WHERE area_name = p_area_name;

    -- Return 1 if the area exists, otherwise return 0
    RETURN IF(area_exists > 0, 1, 0);
END$$

DELIMITER ;


-- procedure to list all the area details
DELIMITER $$

CREATE PROCEDURE List_All_Areas()
BEGIN
    -- Select all area details from the area_neighbourhood table
    SELECT * FROM area_neighbourhood;
END$$

DELIMITER ;


-- procedure to list all the university details 
DELIMITER $$

CREATE PROCEDURE List_All_Universities()
BEGIN
    -- Select all university details from the university table, excluding location and neighbor code
    SELECT university_name, street_no, street_name, city, zip_code, state, country FROM university;
END$$

DELIMITER ;

-- function to check that univeristy name entered by user is valid or not
DELIMITER $$

CREATE FUNCTION Validate_University_Name(
	p_university_name VARCHAR(64)
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE university_exists INT;

    -- Check if the provided university name exists in the university table
    SELECT COUNT(*) INTO university_exists FROM university WHERE university_name = p_university_name;

    -- Return 1 if the university name exists, otherwise return 0
    RETURN IF(university_exists > 0, 1, 0);
END$$

DELIMITER ;

-- procedure to get property amenity details when user enters property id
DELIMITER $$

CREATE PROCEDURE Show_Amenities_For_Property(
    IN p_property_id INT
)
BEGIN
    -- Declare variables to store amenity name and description
    DECLARE amenity_name_var VARCHAR(64);
    DECLARE amenity_description_var TEXT;
    DECLARE property_found BOOLEAN DEFAULT FALSE;

    -- Declare cursor for fetching amenity details
    DECLARE cur CURSOR FOR 
        SELECT a.prop_amenity_name, a.prop_amenity_description
        FROM amenity a
        INNER JOIN property_amenity pa ON a.prop_amenity_name = pa.amenity_name
        WHERE pa.propertyid = p_property_id;

    -- Declare handlers for exceptions
    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET property_found = FALSE;

    -- Open the cursor
    OPEN cur;

    -- Fetch amenity details
    FETCH cur INTO amenity_name_var, amenity_description_var;
    IF NOT property_found THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Property ID is invalid';
    ELSE
        -- Display amenity details
        SELECT amenity_name_var AS 'Amenity Name', amenity_description_var AS 'Description';
    END IF;

    -- Close the cursor
    CLOSE cur;
END$$

DELIMITER ;

-- procedure to add property amenity by broker in property amenity and amenity table 
DELIMITER $$

CREATE PROCEDURE AddAmenityAndPropertyAmenity(
    IN p_property_id INT,
    IN p_broker_id INT,
    IN p_amenity_name VARCHAR(64),
    IN p_amenity_description TEXT
)
BEGIN
    DECLARE amenity_exists INT;
    DECLARE property_exists INT;
    DECLARE property_amenity_exists INT;
    DECLARE broker_property_exists INT;

    -- Check if the property exists in the property table
    SELECT COUNT(*) INTO property_exists FROM property WHERE property_id = p_property_id;

    -- If property id does not exist, throw an error
    IF property_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property ID does not exist';
    ELSE
        -- Check if the property ID and broker ID pair exists in the property table
        SELECT COUNT(*) INTO broker_property_exists FROM property WHERE property_id = p_property_id AND listed_broker = p_broker_id;

        -- If the property ID and broker ID pair does not exist, throw an error
        IF broker_property_exists = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: This property was not added by you, so you cannot update it';
        ELSE
            -- Check if the amenity name exists in the amenity table
            SELECT COUNT(*) INTO amenity_exists FROM amenity WHERE prop_amenity_name = p_amenity_name;

            -- If the amenity exists, insert into property_amenity table only if the combination doesn't exist
            IF amenity_exists > 0 THEN
                -- Check if the combination of property id and amenity name exists in property_amenity table
                SELECT COUNT(*) INTO property_amenity_exists FROM property_amenity WHERE propertyid = p_property_id AND amenity_name = p_amenity_name;

                -- If the combination does not exist, insert into property_amenity table
                IF property_amenity_exists = 0 THEN
                    INSERT INTO property_amenity (propertyid, amenity_name) VALUES (p_property_id, p_amenity_name);
                END IF;
            ELSE
                -- If the amenity does not exist, insert into amenity table first
                INSERT INTO amenity (prop_amenity_name, prop_amenity_description) VALUES (p_amenity_name, p_amenity_description);

                -- Insert into property_amenity table
                INSERT INTO property_amenity (propertyid, amenity_name) VALUES (p_property_id, p_amenity_name);
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;



-- function to insert the review given by user and generate review id 
DELIMITER $$

CREATE FUNCTION Insert_Rating_And_Review_Text(
     p_rating FLOAT,
     p_review_text TEXT
)
RETURNS INT
deterministic
BEGIN
    DECLARE last_review_id INT;
    DECLARE new_review_id INT;

    -- Get the last review ID from the review table
    SELECT COALESCE(MAX(review_id), 0) INTO last_review_id FROM review;

    -- Increment the last review ID to generate a new one
    SET new_review_id = last_review_id + 1;

    -- Insert the new rating and review text into the review table
    INSERT INTO review (rating, review_text, review_id)
    VALUES (p_rating, p_review_text, new_review_id);

    -- Check if the insertion was successful
    IF ROW_COUNT() > 0 THEN
        RETURN new_review_id;
    ELSE
        RETURN -1; -- Return -1 to indicate an error
    END IF;
END$$

DELIMITER ;

-- procedure to enter this property id , review and user id in gives table once review is added by a user
-- user enters prop id for which they want to give review. , review id is returned by above function and user id is stored.
DELIMITER $$

CREATE PROCEDURE Add_Review_Gives(
    IN p_review_id INT,
    IN p_user_id VARCHAR(20),
    IN p_property_id INT
)
BEGIN
    DECLARE property_exists INT;

    -- Check if the property ID exists in the property table
    SELECT COUNT(*) INTO property_exists FROM property WHERE property_id = p_property_id;

    -- If property does not exist, raise an error
    IF property_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property ID does not exist';
    ELSE
        -- Insert the review into the gives table
        INSERT INTO gives (reviewid, property_id, property_seeker_id)
        VALUES (p_review_id, p_property_id, p_user_id);
    END IF;
END$$

DELIMITER ;

-- procedure that prints out all the reviews related to a property 
DELIMITER $$

CREATE PROCEDURE ViewReviewsByPropertyID(
    IN p_property_id INT
)
BEGIN
    DECLARE property_exists INT;

    -- Check if the property ID exists in the property table
    SELECT COUNT(*) INTO property_exists FROM property WHERE property_id = p_property_id;

    -- If property ID does not exist, throw an error
    IF property_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property ID does not exist.';
    ELSE
        -- Retrieve the reviews for the given property ID
        SELECT r.rating AS review_rating, r.review_text AS review_text
        FROM review r
        INNER JOIN gives g ON r.review_id = g.reviewid
        WHERE g.property_id = p_property_id;
    END IF;
END$$

DELIMITER ;


-- function to return first broker that has no of clients less than 5, and if no broker exists or no broker free then
-- null is returned 
DELIMITER $$

CREATE FUNCTION Get_Contact_ID_And_Update_Clients(
    p_property_id INT
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_broker_id INT;

    -- Check if the property ID exists in the property table
    SELECT listed_broker INTO v_broker_id FROM property WHERE property_id = p_property_id;

    -- If property ID does not exist, return null
    IF v_broker_id IS NULL THEN
        RETURN NULL;
    ELSE
        -- Update the no_of_clients for the selected broker ID
        UPDATE property_contact_broker
        SET no_of_clients = no_of_clients + 1
        WHERE contact_id = v_broker_id;
        
        -- Return the broker ID
        RETURN v_broker_id;
    END IF;
END$$

DELIMITER ;

-- user requests view of a property by entering date, property id , and seeker id either asked from user again or stored
-- for broker id , i.e. contactid we get that from back end using above function that gives nof of clients of a broker
-- getting the broker id from above function. 
DELIMITER $$

CREATE PROCEDURE Insert_Request(
    IN p_view_request_date DATE,
    IN p_property_id INT,
    IN p_seeker_id VARCHAR(20),
    IN p_contact_id INT
)
BEGIN
    DECLARE property_exists INT;
    DECLARE request_exists INT;
    DECLARE is_property_available BOOLEAN;

    -- Check if the property ID exists in the property table
    SELECT COUNT(*) INTO property_exists FROM property WHERE property_id = p_property_id;

    -- If property does not exist, raise an error
    IF property_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property ID does not exist';
    ELSE
        -- Check if the property is available
        SELECT is_available INTO is_property_available FROM property WHERE property_id = p_property_id;

        -- If property is not available, give an error
        IF is_property_available = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property is already booked and not available for viewing';
        ELSE
            -- Check if the request entry already exists
            SELECT COUNT(*) INTO request_exists FROM requests WHERE property_id = p_property_id 
                                                              AND seeker_id = p_seeker_id;

            -- If request entry already exists, give an error
            IF request_exists > 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Request entry already exists';
            ELSE
                -- Insert the request into the requests table
                INSERT INTO requests (view_request_date, property_id, seeker_id, contactid)
                VALUES (p_view_request_date, p_property_id, p_seeker_id, p_contact_id);
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;




-- broker can view all requests that broker has got through this procedure. 
DELIMITER $$

CREATE PROCEDURE ViewAllRequests(
    IN p_contact_id INT
)
BEGIN
    SELECT 
        view_request_date AS customer_view_request_date,
        is_complete,
        intent,
        contactid,
        seeker_id,
        property_id,
        approved_rejected
    FROM requests
    WHERE contactid = p_contact_id;
END$$

DELIMITER ;


-- procedure to show property seeker their requests and its status , 
-- this is used for customer to view their application status after request to view
DELIMITER $$

CREATE PROCEDURE GetRequestsByCustomerID(
    IN p_customer_id VARCHAR(20)
)
BEGIN
    DECLARE request_count INT;

    -- Check if any entry exists for the given customer ID in the requests table
    SELECT COUNT(*) INTO request_count
    FROM requests
    WHERE seeker_id = p_customer_id;

    -- If no entry is found, throw an error message
    IF request_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No view requests found. Please set up a request to view a property first.';
    ELSE
        -- Fetch the requests data for the specified customer ID
        SELECT 
            r.view_request_date AS request_date, 
            r.is_complete AS is_completed, 
            r.intent AS request_intent, 
            ru.person_name AS broker_name, 
            r.property_id AS property_identifier, 
            r.approved_rejected AS request_status
        FROM 
            requests r
        JOIN 
            property_contact_broker p ON r.contactid = p.contact_id
        JOIN 
            registered_user ru on p.username = ru.username
        WHERE 
            r.seeker_id = p_customer_id;
    END IF;
END$$

DELIMITER ;


-- broker now can edit the request and add intent of property seeker and is complete or not.
-- to do this broker enters customer id, propertyid and he has his contact id or it is stored with his login 

DELIMITER $$

CREATE FUNCTION UpdateRequestDetails(
    p_property_id INT,
    p_seeker_id VARCHAR(20),
    p_contactid INT,
    p_intent VARCHAR(255),
    p_is_complete BOOLEAN,
    p_approved_rejected_int INT
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_approved_rejected_value VARCHAR(20);
    DECLARE v_exists INT;
    
    -- Check if the specified combination exists in the requests table
    SELECT COUNT(*) INTO v_exists
    FROM requests
    WHERE property_id = p_property_id
        AND seeker_id = p_seeker_id
        AND contactid = p_contactid;
    
    -- If the combination doesn't exist, return -1
    IF v_exists = 0 THEN
        RETURN -1;
    END IF;
    
    -- Map the integer value to the corresponding enum value
    IF p_approved_rejected_int = 1 THEN
        SET v_approved_rejected_value = 'approved request';
    ELSE
        SET v_approved_rejected_value = 'rejected request';
    END IF;
    
    -- Update the request table
    UPDATE requests
    SET 
        intent = p_intent,
        is_complete = p_is_complete,
        approved_rejected = v_approved_rejected_value
    WHERE
        property_id = p_property_id
        AND seeker_id = p_seeker_id
        AND contactid = p_contactid;
    
    -- Check if the update of requests table is successful
    IF ROW_COUNT() > 0 THEN
        -- Update the property_contact_broker table if is_complete is 1
        IF p_is_complete THEN
            UPDATE property_contact_broker
            SET no_of_clients = no_of_clients - 1
            WHERE contact_id = p_contactid;
        END IF;
        
        -- Additional check: If p_approved_rejected_int is 1, return 1
        IF p_approved_rejected_int = 1 THEN
            RETURN 1;
        END IF;
    END IF;
    
    -- Return 0 if request is not accepted or update failed
    RETURN 0;
END$$

DELIMITER ;



-- function that returns 1,-1,0 that help in enabling the option of buy and rent 
DELIMITER $$

CREATE FUNCTION GetRequestDetails(
    p_property_id INT,
    p_contact_id INT
)
RETURNS INT
deterministic
BEGIN
    DECLARE v_approval_status INT;
    
    -- Get the approval status based on the approved_rejected value
    SELECT CASE approved_rejected
        WHEN 'approved request' THEN 1
        WHEN 'rejected request' THEN -1
        ELSE 0
    END INTO v_approval_status
    FROM requests
    WHERE property_id = p_property_id
        AND contactid = p_contact_id;

    
    RETURN v_approval_status;
END$$

DELIMITER ;

-- function that returns 1,-1,0 that help in enabling the option of buy and rent , used for property seeker page
DELIMITER $$

CREATE FUNCTION GetRequestDetailsPropertySeeker(
    p_property_id INT,
    p_seeker_id INT
)
RETURNS INT
deterministic
BEGIN
    DECLARE v_approval_status INT;
    
    -- Get the approval status based on the approved_rejected value
    SELECT CASE approved_rejected
        WHEN 'approved request' THEN 1
        WHEN 'rejected request' THEN -1
        ELSE 0
    END INTO v_approval_status
    FROM requests
    WHERE property_id = p_property_id
        AND seeker_id = p_seeker_id;

    
    RETURN v_approval_status;
END$$

DELIMITER ;





-- procedure to allow the user apply for rent or buy of property. by entering the required details
-- and based on buying/ renting changing that property is_avaialble to not available.
DELIMITER $$

CREATE PROCEDURE Add_Property_Seeker_Property(
    IN p_customer_id_seeker VARCHAR(20),
    IN p_propertyid INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    DECLARE seeker_exists INT;
    DECLARE property_exists INT;

    -- Check if the customer id seeker exists in the property_seeker table
    SELECT COUNT(*) INTO seeker_exists FROM property_seeker WHERE customer_id = p_customer_id_seeker;

    -- If customer id seeker does not exist, throw an error
    IF seeker_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Customer ID is not valid.';
    ELSE
        -- Check if the property id exists in the property table
        SELECT COUNT(*) INTO property_exists FROM property WHERE property_id = p_propertyid;

        -- If property id does not exist, throw an error
        IF property_exists = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property ID is not valid.';
        ELSE
            -- Update the is_available column in the property table for the specified property ID
            UPDATE property SET is_available = 0 WHERE property_id = p_propertyid;

            -- Insert the record into property_seeker_property table
            INSERT INTO property_seeker_property (customer_id_seeker, propertyid, start_date, end_date)
            VALUES (p_customer_id_seeker, p_propertyid, p_start_date, p_end_date);
        END IF;
    END IF;
END$$

DELIMITER ;





-- procedure to update the inserted details of property seeker and property table 
-- after the above procedure executes successfully, then this procedure is called from the backend 
-- values in property seeker property table are updated
DELIMITER $$

CREATE PROCEDURE Update_Property_Seeker_Property(
    IN p_customer_id_seeker VARCHAR(20),
    IN p_propertyid INT
)
BEGIN
    DECLARE prop_price DECIMAL(10,2);
    DECLARE prop_rent_buy VARCHAR(20);
    DECLARE prop_min_tenure INT;
    DECLARE prop_exists INT;
    DECLARE seeker_exists INT;

    -- Check if the customer id seeker exists in the property_seeker table
    SELECT COUNT(*) INTO seeker_exists FROM property_seeker WHERE customer_id = p_customer_id_seeker;

    -- If customer id seeker does not exist, throw an error
    IF seeker_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Customer ID is not valid.';
    ELSE
        -- Check if the property id exists in the property table
        SELECT COUNT(*) INTO prop_exists FROM property WHERE property_id = p_propertyid;

        -- If property id does not exist, throw an error
        IF prop_exists = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Property ID is not valid.';
        ELSE
            -- Find the property details based on the property ID
            SELECT price, rent_buy, min_tenure 
            INTO prop_price, prop_rent_buy, prop_min_tenure 
            FROM property 
            WHERE property_id = p_propertyid;

            -- Update the property details in property_seeker_property table
            UPDATE property_seeker_property 
            SET rent_buying_price = prop_price, 
                description_agreement = CONCAT('Rent/Buy: ', prop_rent_buy, ', Min Tenure: ', CAST(prop_min_tenure AS CHAR), ' months') 
            WHERE propertyid = p_propertyid 
                AND customer_id_seeker = p_customer_id_seeker;
        END IF;
    END IF;
END $$

DELIMITER ;





-- procedure through which user can check the buying / renting details
-- additional can remove 
DELIMITER $$

CREATE PROCEDURE Read_Property_Seeker_Property(
    IN p_customer_id_seeker VARCHAR(20),
    IN p_propertyid INT
)
BEGIN
    DECLARE prop_exists INT;
    
    -- Check if the requested property exists for the given customer
    SELECT COUNT(*) INTO prop_exists 
    FROM property_seeker_property 
    WHERE customer_id_seeker = p_customer_id_seeker 
    AND propertyid = p_propertyid;

    -- If the property does not exist, throw an error message
    IF prop_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: No such request for buying or selling related to this property made by you.';
    ELSE
        -- Retrieve all fields for the requested property
        SELECT customer_id_seeker, propertyid, start_date, end_date, description_agreement, rent_buying_price
        FROM property_seeker_property 
        WHERE customer_id_seeker = p_customer_id_seeker 
        AND propertyid = p_propertyid;
    END IF;
END$$

DELIMITER ;

-- additional procedure for property seeker to have details about area amenity 
DELIMITER $$

CREATE PROCEDURE List_Amenities_By_Area(
    IN p_area_name VARCHAR(64)
)
BEGIN
    DECLARE area_code_val INT;
    DECLARE amenity_count INT;
    
    -- Find the area code for the given area name and city combination
    SELECT area_code INTO area_code_val
    FROM area_neighbourhood
    WHERE area_name = p_area_name ;
    
    -- Check if the area exists
    IF area_code_val IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: The specified area does not exist in the system.';
    ELSE
        -- Count the number of amenities for the found area code
        SELECT COUNT(*) INTO amenity_count
        FROM area_amenity
        WHERE neighbourhood_code = area_code_val;
        
        -- Check if any amenities are listed for the area
        IF amenity_count = 0 THEN
            SELECT 'No amenities listed for this area' AS message;
        ELSE
            -- List all amenities for the found area code
            SELECT amenity_name, amenity_description
            FROM area_amenity
            WHERE neighbourhood_code = area_code_val;
        END IF;
    END IF;
END$$

DELIMITER ;



-- procedure to additionally let the user know all the crimes happening in an area.
DELIMITER $$

CREATE PROCEDURE List_Crimes_By_Area_Name(
    IN p_area_name VARCHAR(64)
)
BEGIN
    DECLARE area_code_p INT;
    DECLARE crime_count INT;
    
    -- Find the area code based on the area name
    SELECT area_code INTO area_code_p
    FROM area_neighbourhood
    WHERE area_name = p_area_name;
    
    -- Check if the area exists
    IF area_code_p IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Area does not exist.';
    ELSE
        -- List all crimes in the specified area
        SELECT COUNT(*) INTO crime_count
        FROM area_crime ac
        JOIN crime c ON ac.crime_code_crime = c.crime_code
        WHERE ac.area_code_area = area_code_p;
        
        -- Check if any crimes are listed for the area
        IF crime_count = 0 THEN
            SELECT 'No crimes listed for this area' AS message;
        ELSE
            SELECT c.crime_code, c.crime_description, c.frequency_of_happening
            FROM area_crime ac
            JOIN crime c ON ac.crime_code_crime = c.crime_code
            WHERE ac.area_code_area = area_code_p;
        END IF;
    END IF;
END$$

DELIMITER ;



-- creating an additional event to check the report of all the requests , every week 

DELIMITER $$
CREATE EVENT GeneratePropertyRequestReport
    ON SCHEDULE
        EVERY 1 WEEK
        STARTS '2024-04-15 00:00:00'
    DO
    BEGIN
        DECLARE total_requests INT;
        DECLARE approved_requests INT;
        DECLARE rejected_requests INT;
        DECLARE pending_requests INT;

        -- Calculate the total number of requests
        SELECT COUNT(*) INTO total_requests FROM requests;

        -- Calculate the number of approved requests
        SELECT COUNT(*) INTO approved_requests FROM requests WHERE approved_rejected = 'approved request';

        -- Calculate the number of rejected requests
        SELECT COUNT(*) INTO rejected_requests FROM requests WHERE approved_rejected = 'rejected request';

        -- Calculate the number of pending requests
        SELECT COUNT(*) INTO pending_requests FROM requests WHERE approved_rejected = 'pending decision';

        -- Insert the report into property_request_report table
        INSERT INTO property_request_report (report_date, total_requests, approved_requests, rejected_requests, pending_requests)
        VALUES (NOW(), total_requests, approved_requests, rejected_requests, pending_requests);
    END$$
DELIMITER ;
