
CREATE DATABASE IF NOT EXISTS boston_housing_project; 

USE boston_housing_project; 

CREATE TABLE crime (
	crime_description text,
    crime_code varchar(64) primary key,
    frequency_of_happening int default 0  );


CREATE TABLE area_neighbourhood (
	area_code int primary key,
    area_name varchar(64) not null,
    state varchar(64) not null,
    country varchar(64) not null,
    crime_rate varchar(64),
    avg_property_price decimal(10,2),
    avg_square_footage decimal(10,2),
    transport_score varchar(64) );
    
    CREATE TABLE area_amenity (
	amenity_name varchar(64),
    amenity_description text,
	longitude FLOAT NOT NULL ,
    latitude FLOAT NOT NULL ,
    neighbourhood_code int not null,
    constraint area_amenity_pk PRIMARY KEY (longitude, latitude),
    CONSTRAINT area_code_fk FOREIGN KEY (neighbourhood_code)
    REFERENCES area_neighbourhood(area_code) ON UPDATE CASCADE ON DELETE CASCADE);
    
CREATE TABLE university (
	university_name varchar(64) primary key,
    longitude FLOAT NOT NULL ,
    latitude FLOAT NOT NULL ,
    street_no int,
    street_name varchar(64),
    city varchar(64) not null,
    zip_code int not null,
    state varchar(64) not null,
    country varchar(64) not null,
    neighbour_code int not null,
    constraint location_unique UNIQUE (longitude, latitude),
    CONSTRAINT areacode_fk FOREIGN KEY (neighbour_code)
    REFERENCES area_neighbourhood(area_code) ON UPDATE CASCADE ON DELETE RESTRICT);  -- restrict will affect anyrelation ?
    
CREATE TABLE area_crime (
	area_code_area int not null,
    crime_code_crime varchar(64) not null,
    CONSTRAINT neighbour_code_fk FOREIGN KEY (area_code_area) 
    REFERENCES area_neighbourhood(area_code) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT crime_code_fk FOREIGN KEY (crime_code_crime) 
    REFERENCES crime(crime_code) ON UPDATE CASCADE ON DELETE CASCADE) ;
    

CREATE TABLE review (
	rating float,
    review_text text,
    review_id int auto_increment primary key);
    
    
CREATE TABLE registered_user (
username varchar(60) primary key,
    user_password varchar(25) not null,
    email varchar(55) not null,
    contact varchar(55),
    person_name varchar(60) not null);


CREATE TABLE property_seeker (
	customer_id varchar(20) unique not null,
    username varchar(60) primary key,
    CONSTRAINT fk_user_seeker FOREIGN KEY (username) 
    REFERENCES registered_user(username) ON UPDATE CASCADE ON DELETE CASCADE); -- USER DELETED THEN DELETE ITS SUBCLASSES
    
CREATE TABLE property_contact_broker (
	contact_id int unique not null,
    contact_type enum('broker','manager','owner' ) DEFAULT 'broker',
    information text,
    username varchar(60) primary key,
    no_of_clients int default 0 ,
    CONSTRAINT fk_user_broker FOREIGN KEY (username) 
    REFERENCES registered_user(username) ON UPDATE CASCADE ON DELETE CASCADE);
    
    CREATE TABLE property (
	property_id int primary key,
    property_type varchar(64) not null,
    price decimal(10,2) not null,
    bedrooms int,
    bathrooms int,
    square_footage decimal(10,2),
    year_built int,
    longitude FLOAT NOT NULL UNIQUE,
    latitude FLOAT NOT NULL UNIQUE,
    street_no int,
    street_name varchar(64),
    city varchar(64) not null,
    zip_code int not null,
    state varchar(64) not null,
    country varchar(64) not null,
    rent_buy varchar(20) not null,
    is_available boolean default 1,
    areacode int not null,
    min_tenure varchar(50) not null,
    listed_broker int not null,
    CONSTRAINT fk_contactid_property FOREIGN KEY (listed_broker) 
    REFERENCES property_contact_broker(contact_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT areacode_fk_property FOREIGN KEY (areacode) 
    REFERENCES area_neighbourhood(area_code) ON UPDATE CASCADE ON DELETE RESTRICT); -- OR CAN DO ON DELETE SET DEFAULT BUT THAT'S LESS RELEVANT 
    
    
CREATE TABLE amenity (
	prop_amenity_name varchar(64) primary key,
    prop_amenity_description text);
 


CREATE TABLE property_amenity (
	propertyid int not null,
    amenity_name varchar(64) not null,
    constraint pk_property_amenity primary key (propertyid, amenity_name),
    CONSTRAINT fk_property_amenity FOREIGN KEY (propertyid) 
    REFERENCES property(property_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_amenity FOREIGN KEY (amenity_name) 
    REFERENCES amenity(prop_amenity_name) ON UPDATE CASCADE ON DELETE CASCADE); -- THIS CAN BE RESTRICT BUT NOT REQUIRED

CREATE TABLE property_seeker_property (
	customer_id_seeker varchar(20) not null,
    propertyid int not null,
    start_date date ,
    end_date date ,
    description_agreement text,
    rent_buying_price decimal(15,2),
    CONSTRAINT primary_key_property_seeker PRIMARY KEY (customer_id_seeker, propertyid),
    CONSTRAINT fk_propertyid FOREIGN KEY (propertyid) 
    REFERENCES property(property_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_property_seeker FOREIGN KEY (customer_id_seeker) 
    REFERENCES property_seeker(customer_id) ON UPDATE CASCADE ON DELETE CASCADE); 
    
CREATE TABLE gives (
	reviewid int not null,
    property_id int not null,
    property_seeker_id varchar(20) not null,
    CONSTRAINT primary_key_gives PRIMARY KEY (reviewid, property_id, property_seeker_id),
    CONSTRAINT fk_propertyid_gives FOREIGN KEY (property_id) 
    REFERENCES property(property_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_property_seeker_gives FOREIGN KEY (property_seeker_id) 
    REFERENCES property_seeker(customer_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_review_gives FOREIGN KEY (reviewid) 
    REFERENCES review(review_id) ON UPDATE CASCADE ON DELETE RESTRICT); -- NOT ALLOWING TO DELETE A REVIEW 




CREATE TABLE requests (
	view_request_date date not null,
    is_complete boolean default 0,
    intent VARCHAR(255), 
    contactid int not null,
    seeker_id varchar(20) not null,
    property_id int not null,
    approved_rejected enum('approved request','rejected request','pending decision' ) DEFAULT 'pending decision',
    CONSTRAINT primary_key_request PRIMARY KEY (contactid, seeker_id,property_id),
    CONSTRAINT fk_propertyid_request FOREIGN KEY (property_id) 
    REFERENCES property(property_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_property_seeker_request FOREIGN KEY (seeker_id) 
    REFERENCES property_seeker(customer_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_contactid_request FOREIGN KEY (contactid) 
    REFERENCES property_contact_broker(contact_id) ON UPDATE CASCADE ON DELETE CASCADE); 
    
-- additional table to get report of requests 
CREATE TABLE property_request_report (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    report_date TIMESTAMP NOT NULL,
    total_requests INT NOT NULL,
    approved_requests INT NOT NULL,
    rejected_requests INT NOT NULL,
    pending_requests INT NOT NULL
);


-- inserting values into area table 

INSERT INTO area_neighbourhood (area_code, area_name, state, country, crime_rate, avg_property_price, avg_square_footage, transport_score)
VALUES
    (02115, 'Mission Hill', 'Massachusetts', 'USA', 'Low', 150000.00, 1200.00, 'Good'),
    (02120, 'Roxbury', 'Massachusetts', 'USA', 'Medium', 130000.00, 1100.00, 'Average'),
    (02215, 'Fenway', 'Massachusetts', 'USA', 'Low', 180000.00, 1300.00, 'Good'),
    (02116, 'Back Bay', 'Massachusetts', 'USA', 'Low', 250000.00, 1500.00, 'Excellent'),
    (02118, 'South End', 'Massachusetts', 'USA', 'Medium', 220000.00, 1400.00, 'Good'),
    (02108, 'Beacon Hill', 'Massachusetts', 'USA', 'Low', 300000.00, 1700.00, 'Excellent'),
    (02129, 'Charlestown', 'Massachusetts', 'USA', 'Low', 190000.00, 1200.00, 'Good'),
    (02113, 'North End', 'Massachusetts', 'USA', 'Medium', 210000.00, 1300.00, 'Average'),
    (02125, 'Dorchester', 'Massachusetts', 'USA', 'High', 120000.00, 1000.00, 'Average'),
    (02132, 'West Roxbury', 'Massachusetts', 'USA', 'Low', 280000.00, 1600.00, 'Good'),
    (02110, 'Financial District', 'Massachusetts', 'USA', 'Low', 320000.00, 1800.00, 'Excellent'),
    (02111, 'Chinatown', 'Massachusetts', 'USA', 'Medium', 260000.00, 1400.00, 'Good'),
    (02109, 'North End Waterfront', 'Massachusetts', 'USA', 'Low', 290000.00, 1700.00, 'Excellent'),
    (02121, 'Dorchester Center', 'Massachusetts', 'USA', 'Medium', 150000.00, 1100.00, 'Average'),
    (02126, 'Mattapan', 'Massachusetts', 'USA', 'High', 110000.00, 950.00, 'Poor'),
    (02122, 'Fields Corner', 'Massachusetts', 'USA', 'Medium', 140000.00, 1050.00, 'Average'),
    (02130, 'Jamaica Plain', 'Massachusetts', 'USA', 'Low', 200000.00, 1250.00, 'Good'),
    (02131, 'Roslindale', 'Massachusetts', 'USA', 'Low', 210000.00, 1300.00, 'Good'),
    (02124, 'Lower Mills', 'Massachusetts', 'USA', 'Medium', 160000.00, 1150.00, 'Average'),
    (02127, 'South Boston', 'Massachusetts', 'USA', 'Medium', 240000.00, 1450.00, 'Good'),
    (02128, 'East Boston', 'Massachusetts', 'USA', 'Medium', 200000.00, 1200.00, 'Good'),
    (02134, 'Allston', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02135, 'Brighton', 'Massachusetts', 'USA', 'Medium', 210000.00, 1300.00, 'Average'),
    (02136, 'Hyde Park', 'Massachusetts', 'USA', 'Medium', 190000.00, 1200.00, 'Average'),
    (02137, 'Readville', 'Massachusetts', 'USA', 'Low', 270000.00, 1550.00, 'Good'),
    (02138, 'Harvard Square', 'Massachusetts', 'USA', 'Low', 280000.00, 1600.00, 'Good'),
    (02139, 'Central Square', 'Massachusetts', 'USA', 'Medium', 230000.00, 1400.00, 'Average'),
    (02140, 'North Cambridge', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02141, 'East Cambridge', 'Massachusetts', 'USA', 'Low', 270000.00, 1550.00, 'Good'),
    (02142, 'Kendall Square', 'Massachusetts', 'USA', 'Low', 290000.00, 1700.00, 'Good'),
    (02143, 'Somerville', 'Massachusetts', 'USA', 'Medium', 210000.00, 1300.00, 'Average'),
    (02144, 'Ball Square', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02145, 'Tufts University', 'Massachusetts', 'USA', 'Low', 300000.00, 1750.00, 'Good'),
    (02146, 'Packing District', 'Massachusetts', 'USA', 'Medium', 240000.00, 1450.00, 'Average'),
    (02147, 'Sullivan Square', 'Massachusetts', 'USA', 'Medium', 230000.00, 1400.00, 'Average'),
    (02148, 'Assembly Square', 'Massachusetts', 'USA', 'Low', 280000.00, 1600.00, 'Good'),
    (02149, 'Mystic River', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02150, 'Chelsea', 'Massachusetts', 'USA', 'High', 120000.00, 950.00, 'Average'),
    (02151, 'Revere Beach', 'Massachusetts', 'USA', 'Medium', 200000.00, 1200.00, 'Good'),
    (02152, 'Winthrop', 'Massachusetts', 'USA', 'Low', 270000.00, 1550.00, 'Excellent'),
    (02153, 'Point Shirley', 'Massachusetts', 'USA', 'Low', 280000.00, 1600.00, 'Good'),
    (02154, 'Marina Bay', 'Massachusetts', 'USA', 'Low', 290000.00, 1650.00, 'Excellent'),
    (02155, 'North Woburn', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02156, 'Burlington', 'Massachusetts', 'USA', 'Low', 270000.00, 1550.00, 'Good'),
    (02157, 'Bedford', 'Massachusetts', 'USA', 'Medium', 230000.00, 1400.00, 'Average'),
    (02158, 'Lexington', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02159, 'Waltham', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02160, 'Watertown', 'Massachusetts', 'USA', 'Low', 270000.00, 1550.00, 'Good'),
    (02161, 'Newton', 'Massachusetts', 'USA', 'Medium', 240000.00, 1450.00, 'Average'),
    (02162, 'Wellesley', 'Massachusetts', 'USA', 'Low', 290000.00, 1650.00, 'Excellent'),
    (02163, 'Needham', 'Massachusetts', 'USA', 'Low', 280000.00, 1600.00, 'Good'),
    (02164, 'Brookline', 'Massachusetts', 'USA', 'Low', 300000.00, 1700.00, 'Excellent'),
    (02165, 'Milton', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02166, 'Quincy', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average'),
    (02167, 'Braintree', 'Massachusetts', 'USA', 'High', 120000.00, 950.00, 'Average'),
    (02168, 'Weymouth', 'Massachusetts', 'USA', 'Medium', 200000.00, 1200.00, 'Good'),
    (02169, 'Hingham', 'Massachusetts', 'USA', 'Low', 270000.00, 1550.00, 'Excellent'),
    (02170, 'Cohasset', 'Massachusetts', 'USA', 'Low', 280000.00, 1600.00, 'Good'),
    (02171, 'Scituate', 'Massachusetts', 'USA', 'Medium', 220000.00, 1350.00, 'Average');
    
    -- inserting data for area amenity table
    
    INSERT INTO area_amenity (amenity_name, amenity_description, longitude, latitude, neighbourhood_code)
VALUES
    ('Park', 'A spacious area with playgrounds and walking paths.', -71.056799, 42.360081, 02115),
    ('Grocery Store', 'A convenience store for fresh produce and everyday groceries.', -71.085222, 42.335693, 02120),
    ('Restaurant', 'A cozy eatery serving delicious meals.', -71.099771, 42.347195, 02215),
    ('Café', 'A casual spot for coffee and light snacks.', -71.083937, 42.351842, 02116),
    ('Library', 'A quiet space for reading and studying.', -71.071998, 42.341438, 02118),
    ('Gym', 'A fitness center equipped with exercise machines and classes.', -71.073091, 42.361145, 02108),
    ('Pharmacy', 'A drugstore providing prescription medications and health products.', -71.060832, 42.379536, 02129),
    ('Hospital', 'A medical facility offering a range of healthcare services.', -71.055049, 42.366207, 02113),
    ('Bank', 'A financial institution for various banking needs.', -71.059567, 42.303649, 02125),
    ('Movie Theater', 'A cinema for watching the latest films.', -71.148914, 42.279039, 02132),
    ('Shopping Mall', 'A large retail complex with diverse stores.', -71.077878, 42.356858, 02110),
    ('Post Office', 'A facility for sending and receiving mail and packages.', -71.065421, 42.352199, 02111),
    ('Pet Store', 'A shop offering pet supplies and accessories.', -71.055318, 42.364510, 02109),
    ('Park', 'A green space for outdoor activities and relaxation.', -71.075937, 42.289370, 02121),
    ('Theater', 'A venue for live performances and cultural events.', -71.092219, 42.277322, 02126),
    ('Laundry', 'A place for washing and drying clothes.', -71.057110, 42.277759, 02122),
    ('School', 'An educational institution providing learning opportunities.', -71.115684, 42.309888, 02130),
    ('Gas Station', 'A service station for refueling vehicles.', -71.102095, 42.308900, 02131),
    ('Bookstore', 'A store selling a variety of books and stationery.', -71.090736, 42.311336, 02124),
    ('Bus Stop', 'A designated spot for boarding and alighting buses.', -71.056748, 42.344372, 02127);

-- inserting tuples in university table 
INSERT INTO university (university_name, longitude, latitude, street_no, street_name, city, zip_code, state, country, neighbour_code)
VALUES
    ('Harvard University', -71.1167, 42.3736, 123, 'Harvard St', 'Cambridge', 02138, 'Massachusetts', 'USA', 02115),
    ('Massachusetts Institute of Technology', -71.0921, 42.3601, 77, 'Massachusetts Ave', 'Cambridge', 02139, 'Massachusetts', 'USA', 02120),
    ('Boston University', -71.0964, 42.3505, 1, 'Commonwealth Ave', 'Boston', 02215, 'Massachusetts', 'USA', 02215),
    ('Northeastern University', -71.0883, 42.3400, 360, 'Huntington Ave', 'Boston', 02115, 'Massachusetts', 'USA', 02115),
    ('Boston College', -71.1686, 42.3356, 140, 'Commonwealth Ave', 'Chestnut Hill', 02467, 'Massachusetts', 'USA', 02132),
    ('Tufts University', -71.1190, 42.4067, 419, 'Boston Ave', 'Medford', 02155, 'Massachusetts', 'USA', 02130),
    ('Suffolk University', -71.0626, 42.3601, 8, 'Ashburton Pl', 'Boston', 02108, 'Massachusetts', 'USA', 02129),
    ('Emerson College', -71.0675, 42.3539, 120, 'Boylston St', 'Boston', 02116, 'Massachusetts', 'USA', 02116),
    ('Boston Conservatory at Berklee', -71.0909, 42.3461, 8, 'The Fenway', 'Boston', 02215, 'Massachusetts', 'USA', 02215),
    ('University of Massachusetts Boston', -71.0365, 42.3133, 100, 'Morrissey Blvd', 'Boston', 02125, 'Massachusetts', 'USA', 02125);


-- inserting tuples in crime table 
INSERT INTO crime (crime_description, crime_code, frequency_of_happening)
VALUES
    ('Assault', 'ASSLT', 100),
    ('Burglary', 'BURGL', 75),
    ('Robbery', 'ROBB', 60),
    ('Motor Vehicle Theft', 'MVTHEFT', 50),
    ('Shoplifting', 'SHOPLFT', 40),
    ('Vandalism', 'VAND', 35),
    ('Drug Possession', 'DRUGPOS', 30),
    ('Fraud', 'FRAUD', 25),
    ('Theft', 'THEFT', 20),
    ('Arson', 'ARSON', 15),
    ('Breaking and Entering', 'BRKENT', 12),
    ('Domestic Violence', 'DV', 10),
    ('Stalking', 'STALK', 8),
    ('Homicide', 'HOMIC', 5),
    ('Identity Theft', 'IDTHEFT', 4),
    ('Kidnapping', 'KIDNAP', 3),
    ('Sexual Assault', 'SEXASSLT', 2),
    ('Trespassing', 'TRESP', 2),
    ('Harassment', 'HARASS', 2),
    ('Embezzlement', 'EMBEZZ', 1),
    ('Forgery', 'FORG', 1),
    ('Hate Crime', 'HATECR', 1),
    ('Money Laundering', 'MONEYLND', 1),
    ('Public Intoxication', 'PUBINTOX', 1);


-- inserting tuple in crime_area table 
INSERT INTO area_crime (area_code_area, crime_code_crime)
VALUES
    (02115, 'ASSLT'),  -- Mission Hill - Assault
    (02115, 'BURGL'),  -- Mission Hill - Burglary
    (02120, 'ROBB'),   -- Roxbury - Robbery
    (02215, 'MVTHEFT'),-- Fenway - Motor Vehicle Theft
    (02116, 'SHOPLFT'),-- Back Bay - Shoplifting
    (02116, 'VAND'),   -- Back Bay - Vandalism
    (02118, 'DRUGPOS'),-- South End - Drug Possession
    (02118, 'THEFT'),  -- South End - Theft
    (02129, 'BRKENT'), -- Charlestown - Breaking and Entering
    (02113, 'DV'),     -- North End - Domestic Violence
    (02125, 'STALK'),  -- Dorchester - Stalking
    (02125, 'HOMIC'),  -- Dorchester - Homicide
    (02132, 'IDTHEFT'),-- West Roxbury - Identity Theft
    (02132, 'SEXASSLT'),-- West Roxbury - Sexual Assault
    (02132, 'TRESP'),  -- West Roxbury - Trespassing
    (02132, 'HARASS'); -- West Roxbury - Harassment
