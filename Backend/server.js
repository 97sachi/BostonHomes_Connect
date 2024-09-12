const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

// Generate a random secure secret key
const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes converted to hexadecimal
};

const secretKey = generateSecretKey();

const [,, username, password] = process.argv;

const db = mysql.createConnection({
    host: 'localhost',
    user: username,
    password: password,
    database: 'boston_housing_project'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

app.use(bodyParser.json());

// Middleware function to verify JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify the token
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            } else if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized: Token expired' });
            } else {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        }
        // If token is valid, store decoded user information in request object
        req.user = decoded;
        next();
    });
};

// User registration endpoint using stored procedure
app.post('/register', (req, res) => {
    const { username, password, email, contact, personName, role } = req.body;

    db.query('CALL Insert_User(?, ?, ?, ?, ?)', [username, password, email, contact, personName], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ message: 'Username already exists' });
            } else {
                console.log(err)
                res.status(500).json({ message: 'Failed to register user' });
            }
        } else {
            if (role === 'broker') {
                db.query('SELECT Insert_Contact_Broker(?) AS contactId', [username], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to insert contact for broker' });
                    }
                    const contactId = results[0].contactId;
                    const token = jwt.sign({ username, role, contactId }, secretKey, { expiresIn: '1h' });
                    return res.status(201).json({ message: 'User registered successfully', contactId, token });
                });
            } else {
                db.query('SELECT Insert_Property_Seeker(?) AS customerId', [username], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to insert property seeker' });
                    }
                    const customerId = results[0].customerId;
                    const token = jwt.sign({ username, role, customerId }, secretKey, { expiresIn: '1h' });
                    return res.status(201).json({ message: 'User registered successfully', customerId, token, role });
                });
            }
        }
    });
});

// User login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT Validate_User_Login(?, ?) AS loginResult', [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate' });
        }

        const loginResult = results[0].loginResult;
        if (loginResult === 1) {
            db.query('SELECT CheckUsernameInPropertyContactBroker(?) AS isBroker', [username], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to check user role' });
                }

                const isBroker = results[0].isBroker;

                // Set the role based on whether the user is a broker or not
                const role = isBroker === 1 ? 'broker' : 'user';

                // Generate JWT token with the username and role
                const token = jwt.sign({ username, role }, secretKey, { expiresIn: '1h' });

                // Return the token to the client
                return res.status(200).json({ token, role });
            });
        } else if (loginResult === 0) {
            return res.status(401).json({ message: 'User does not exist' });
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

app.get('/property/:propertyId', verifyToken,async (req, res) => {
    const {propertyId} = req.params;
    try {
        db.query('CALL GetPropertyDetailsById(?)',[propertyId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to fetch property details' });
            }
            const propertyDetails = results[0];
            return res.status(200).json({ propertyDetails });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/broker-details/:username', (req, res) => {
    const { username } = req.params;
    const { contactType, information } = req.body;

    db.query('SELECT COUNT(*) AS count FROM property_contact_broker WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to check user existence' });
        }

        const userExists = results[0].count;

        if (userExists === 0) {
            return res.status(404).json({ message: 'User not found in property contact broker table' });
        }

        db.query('CALL Insert_Property_Contact_Broker(?, ?, ?)', [contactType, information, username], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to insert broker details' });
            }

            return res.status(201).json({ message: 'Broker details inserted successfully' });
        });
    });
});


// Endpoint to handle filter selection
app.post('/bedrooms_and_bathrooms', (req, res) => {
    const { bedrooms, bathrooms } = req.body;
    console.log(req.body)

    // Execute the stored procedure Show_Properties_By_Bedrooms_And_Bathrooms
    db.query('CALL Show_Properties_By_Bedrooms_And_Bathrooms(?, ?)', [bedrooms, bathrooms], (err, results) => {
        if (err) {

            return res.status(500).json({ message: err });
            // return res.status(500).json({ message: 'Failed to fetch properties by bedrooms and bathrooms' });
        }
        return res.status(200).json({ properties: results[0] });
    });
});

// Endpoint to handle filter selection
app.post('/property_type', (req, res) => {
    const { type } = req.body;

    // Execute the stored procedure Show_Properties_By_Bedrooms_And_Bathrooms
    db.query('CALL Show_Properties_By_Type(?)', [type], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: err });
            // return res.status(500).json({ message: 'Failed to fetch properties by bedrooms and bathrooms' });
        }
        return res.status(200).json({ properties: results[0] });
    });
});

// Endpoint to handle filter selection
app.post('/bedrooms', (req, res) => {
    const { bedrooms } = req.body;
    console.log(req.body)

    // Execute the stored procedure Show_Properties_By_Bedrooms
    db.query('CALL Show_Properties_By_Bedrooms(?)', [bedrooms], (err, results) => {
        if (err) {
            
            return res.status(500).json({ message: err });
            // return res.status(500).json({ message: 'Failed to fetch properties by bedrooms' });
        }
        return res.status(200).json({ properties: results[0] });
    });
});

// Endpoint to handle filter selection
app.post('/bathrooms', (req, res) => {
    const { bathrooms } = req.body;
    console.log(req.body)

    // Execute the stored procedure Show_Properties_By_Bedrooms_And_Bathrooms
    db.query('CALL Show_Properties_By_Bathrooms(?)', [bathrooms], (err, results) => {
        if (err) {

            return res.status(500).json({ message: err });
            // return res.status(500).json({ message: 'Failed to fetch properties by bedrooms and bathrooms' });
        }
        return res.status(200).json({ properties: results[0] });
    });
});

// Endpoint to handle filter selection
app.post('/area', (req, res) => {
    const { area_name } = req.body;

    // Validate the area name using the Check_Area_Existence function
    db.query('SELECT Check_Area_Existence(?) AS areaExists', [area_name], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to validate area name' });
        }

        const areaExists = results[0].areaExists;

        if (areaExists === 1) {
            // Call the filter procedure with the validated area name
            db.query('CALL Filter_By_Area(?)', [area_name], (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to filter by area' });
                }
                return res.status(200).json({ properties: results[0] });
            });
        } else {
            return res.status(400).json({ message: 'Area does not exist' });
        }
    });
});

app.post('/university', (req, res) => {
    const { university } = req.body;

    // Validate the area name using the Check_Area_Existence function
    db.query('SELECT Validate_University_Name(?) AS university_exists', [university], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to validate university name' });
        }

        const universityExists = results[0].university_exists;

        if (universityExists === 1) {
            // Call the filter procedure with the validated area name
            db.query('CALL Show_Properties_By_University(?)', [university], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json(err.sqlMessage);
                }
                return res.status(200).json({ properties: results[0] });
            });
        } else {
            return res.status(400).json({ message: 'University does not exist' });
        }
    });
});

// Endpoint to handle filter by price range
app.post('/filter/price_range', (req, res) => {
    const { lowerRange, upperRange } = req.body;

    // Execute the stored procedure Show_Properties_By_Price_Range
    db.query('CALL Show_Properties_By_Price_Range(?, ?)', [lowerRange, upperRange], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch properties by price range' });
        }
        return res.status(200
        ).json({ properties: results[0] });
    });
});

// Endpoint to list all universities
app.get('/universities', (req, res) => {
    // Call the List_All_Universities stored procedure
    db.query('CALL List_All_Universities()', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch universities' });
        }
        // Extract the list of universities from the results
        const universities = results[0];
        return res.status(200).json({ universities });
    });
});

// Endpoint to list all universities
app.get('/areas', verifyToken, (req, res) => {
    // Call the List_All_Areas stored procedure
    db.query('CALL List_All_Areas()', (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({err});
        }
        // Extract the list of areas from the results
        const areas = results[0];
        return res.status(200).json({ areas });
    });
});

app.post('/add-property', verifyToken, async (req, res) => {
    const { property_id, property_type, price, bedrooms, bathrooms, square_footage, year_built, longitude, latitude, street_no, street_name, city, zip_code, state, country, rent_buy, is_available, areacode, min_tenure } = req.body;


    // Check if the user is authenticated and is a broker
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    try {
        const contactId = await getContactIdByUsername(req.user.username);
        // Call the Add_Property_Details stored procedure
        db.query('CALL Add_Property_Details(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [property_id, property_type, price, bedrooms, bathrooms, square_footage, year_built, longitude, latitude, street_no, street_name, city, zip_code, state, country, rent_buy, is_available, areacode, min_tenure, contactId], (err, results) => {
            if (err) {
                return res.status(500).json({message: err.sqlMessage});
            }
            return res.status(201).json({ message: 'Property details added successfully' });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not add property' });
    }

});

app.post('/add-amenity', verifyToken, async (req, res) => {
    const { property_id, amenity_name, amenity_description } = req.body;

    // Check if the user making the request is a broker
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Only brokers can delete properties' });
    }

    try {
        const contactId = await getContactIdByUsername(req.user.username);
        // Call the stored procedure
        db.query('CALL AddAmenityAndPropertyAmenity(?, ?, ?, ?)', [property_id, contactId, amenity_name, amenity_description], (error, results) => {
            if (error) {
                // Handle error
                console.log(error);
                res.status(500).json({ message: error.sqlMessage === "Error: Property ID does not exist" ? error.sqlMessage : "Error adding amenity!" });
            } else {
                res.status(200).json({ message: 'Amenity added successfully' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error: Unable to add amenity' });
    }
});

// Endpoint to delete a property
app.delete('/delete-property/:property_id', verifyToken, async (req, res) => {
    // Extract the property_id from the request parameters
    const { property_id } = req.params;

    // Check if the user making the request is a broker
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Only brokers can delete properties' });
    }

    try {
        const contactId = await getContactIdByUsername(req.user.username);
        // Call the Delete_Property function to delete the property
        db.query('SELECT Delete_Property(?, ?) AS deleteResult', [property_id, contactId], (err, results) => {
            if (err) {
                // Handle database error
                return res.status(500).json({ message: 'Failed to delete property' });
            }

            const deleteResult = results[0].deleteResult;

            // Check the delete result returned by the function
            if (deleteResult === 1) {
                // Property does not exist
                return res.status(404).json({ message: 'Property not found' });
            } else if (deleteResult === 0) {
                // Property deleted successfully
                return res.status(200).json({ message: 'Property deleted successfully' });
            } else {
                // Property exists but could not be deleted
                return res.status(500).json({ message: 'Failed to delete property' });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete property' });
    }
});

app.put('/update-property', verifyToken, async (req, res) => {
    // Check if the user making the request is a broker
    if (req.user.role !== 'broker') {
        return res.status(403).json({ message: 'Only brokers can update properties' });
    }

    // Extract property details from the request body
    const {
        property_id,
        property_type,
        price,
        bedrooms,
        bathrooms,
        square_footage,
        year_built,
        longitude,
        latitude,
        street_no,
        street_name,
        city,
        zip_code,
        state,
        country,
        rent_buy,
        is_available,
        areacode,
        min_tenure
    } = req.body;

    try {
        const contactId = await getContactIdByUsername(req.user.username);
        db.query(
            'SELECT Update_Property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) AS updateResult',
            [
                property_id,
                contactId,
                property_type,
                price,
                bedrooms,
                bathrooms,
                square_footage,
                year_built,
                longitude,
                latitude,
                street_no,
                street_name,
                city,
                zip_code,
                state,
                country,
                rent_buy,
                is_available,
                areacode,
                min_tenure
            ],
            (err, results) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({ message: err.sqlMessage });
                }

                const updateResult = results[0].updateResult;

                // Check the update result returned by the function
                if (updateResult === 0) {
                    // Property does not exist
                    return res.status(404).json({ message: 'Property not found for this you' });
                } else if (updateResult === 1) {
                    // Property updated successfully
                    return res.status(200).json({ message: 'Property updated successfully' });
                } else {
                    // Failed to update property
                    return res.status(500).json({ message: 'Failed to update property' });
                }
            }
        );
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update property' });
    }
});

// Endpoint to retrieve amenities for a property
app.get('/:property_id/amenities', verifyToken, (req, res) => {
    const { property_id } = req.params;

    // Call the stored procedure to retrieve amenities for the specified property
    db.query('CALL Show_Amenities_For_Property(?)', [property_id], (err, results) => {
        if (err) {
            console.log(err);
            // Handle database error
            return res.status(500).json({ message: 'Failed to retrieve amenities' });
        }

        // Check if any amenities are found
        if (results.length === 0) {
            return res.status(404).json({ message: 'Property ID is invalid or no amenities found' });
        }

        // Extract amenity details from the results
        const amenities = results[0];
        console.log(amenities);

        // Send the amenities to the client
        res.status(200).json({ amenities });
    });
});

// Endpoint to retrieve reviews for a property
app.get('/:property_id/reviews', verifyToken, (req, res) => {
    const { property_id } = req.params;

    // Call the stored procedure to retrieve amenities for the specified property
    db.query('CALL ViewReviewsByPropertyID(?)', [property_id], (err, results) => {
        if (err) {
            console.log(err);
            // Handle database error
            return res.status(500).json({ message: 'Failed to retrieve reviews' });
        }

        // Check if any amenities are found
        if (results.length === 0) {
            return res.status(404).json({ message: 'Property ID is invalid or no reviews found' });
        }

        // Extract amenity details from the results
        const reviews = results[0];
        console.log(reviews);

        // Send the amenities to the client
        res.status(200).json({ reviews });
    });
});

// Endpoint to add a review given by a user to a property
app.post('/:property_id/reviews', verifyToken, (req, res) => {
    const { property_id } = req.params;
    const { rating, review_text } = req.body;
    const username = req.user.username;

    // Check if the user role is "user"
    if (req.user.role !== 'user') {
        return res.status(403).json({ message: 'Only users can give reviews' });
    }

    // Call the function to get the customer ID from the username
    db.query('SELECT GetCustomerIdByUsername(?) AS customer_id', [username], (err, results) => {
        if (err) {
            // Handle database error
            return res.status(500).json({ message: 'Failed to add review' });
        }

        const customer_id = results[0].customer_id;

        // Call the function to insert the rating and review text
        db.query('SELECT Insert_Rating_And_Review_Text(?, ?) AS new_review_id', [rating, review_text], (err, results) => {
            if (err) {
                // Handle database error
                return res.status(500).json(err, { message: 'Failed to add review' });
            }

            const new_review_id = results[0].new_review_id;

            // Check if the review ID was generated successfully
            if (new_review_id === -1) {
                return res.status(500).json({ message: 'Failed to add review' });
            }

            // Call the procedure to insert the review into the gives table
            db.query('CALL Add_Review_Gives(?, ?, ?)', [new_review_id, customer_id, property_id], (err, results) => {
                if (err) {
                    // Handle database error
                    return res.status(500).json(err);
                }

                // Return success response
                return res.status(201).json({ message: 'Review added successfully', review_id: new_review_id });
            });
        });
    });
});

// Function to get contact ID of a broker with less than 5 clients
const getContactIdAndUpdateClients = (property_id) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT Get_Contact_ID_And_Update_Clients(?) AS contactId`;
        db.query(sql,[property_id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0].contactId);
            }
        });
    });
};

const getRequestDetailsPropertySeeker = (propertyId, seekerId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT GetRequestDetailsPropertySeeker(?, ?) AS approval_status';
        db.query(query, [propertyId, seekerId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    const approvalStatus = results[0].approval_status;
                    resolve(approvalStatus);
                } else {
                    reject(new Error('Failed to fetch approval status'));
                }
            }
        });
    });
};



const getCustomerIdByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT GetCustomerIdByUsername(?) AS customer_id';
        db.query(query, [username], (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    const customerId = results[0].customer_id;
                    resolve(customerId);
                } else {
                    reject(new Error('Username does not exist'));
                }
            }
        });
    });
};


// Endpoint to get approval status for a property
app.get('/:propertyId/approvalStatus', verifyToken, async (req, res) => {
    try {
        // Get the property ID from request parameters
        const { propertyId } = req.params;

        // Get the seeker ID using the username from the token
        const seekerUsername = req.user.username;
        const seekerId = await getCustomerIdByUsername(seekerUsername);

        // Call the function to get approval status
        const approvalStatus = await getRequestDetailsPropertySeeker(propertyId, seekerId);
        console.log(approvalStatus);

        // Send the approval status as response
        res.status(200).json({ approvalStatus });
    } catch (error) {
        console.error('Error fetching approval status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const getContactIdByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT GetContactIdByUsername(?) AS contact_id';
        db.query(query, [username], (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    const contactId = results[0].contact_id;
                    resolve(contactId);
                } else {
                    reject(new Error('Username does not exist'));
                }
            }
        });
    });
};

// Endpoint to handle property view requests
app.post('/:property_id/request_view', verifyToken, async (req, res) => {
    const { property_id } = req.params;
    const username = req.user.username;
    const date = req.body.date;

    if (req.user)

        try {
            const customerId = await getCustomerIdByUsername(username);
            const contactId = await getContactIdAndUpdateClients(property_id);

            // Insert request into the database
            const query = 'CALL Insert_Request(?, ?, ?, ?)';
            db.query(query, [date, property_id, customerId, contactId], (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500).json(err);
                } else {
                    res.status(200).json({ message: 'Request added successfully' });
                }
            });
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error.message });
        }
});

// Function to get requests under a broker
const getRequestsForBroker = (contactId) => {
    return new Promise((resolve, reject) => {
        // Execute the stored procedure to get requests
        db.query(
            'CALL ViewAllRequests(?)',
            [contactId],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]); // Assuming the result is an array of request objects
                }
            }
        );
    });
};


// Endpoint to get requests under a broker
app.get('/broker/requests', verifyToken, async (req, res) => {
    const username = req.user.username;

    if (req.user.role != "broker") {
        return res.status(400).json({ error: 'Only broker allowed to view requests' });
    }

    try {
        const contactId = await getContactIdByUsername(username);

        const requests = await getRequestsForBroker(contactId);
        res.json(requests);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json(error);
    }
});

const getRequestsByCustomerId = (customerId) => {
    return new Promise((resolve, reject) => {
        db.query('CALL GetRequestsByCustomerID(?)', [customerId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
};

// Endpoint to get requests for a property seeker
app.get('/customer/requests', verifyToken, async (req, res) => {
    const username = req.user.username

    if (req.user.role != "user") {
        return res.status(400).json({ error: 'Not authorized to see requests' });
    }

    try {
        // Call the function to get customer ID from the username
        const customerId = await getCustomerIdByUsername(username);

        // Call the stored procedure to get requests for the customer ID
        const requests = await getRequestsByCustomerId(customerId);

        res.json(requests);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json(error);
    }
});

const updateRequestDetails = (propertyId, seekerId, contactId, intent, isComplete, approvedRejectedInt) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT UpdateRequestDetails(?, ?, ?, ?, ?, ?) AS updatedStatus', [propertyId, seekerId, contactId, intent, isComplete, approvedRejectedInt], (err, results) => {
            if (err) {
                reject(err);
            } else {
                // Extract the result of the stored function
                const updatedStatus = results[0];
                resolve(updatedStatus);
            }
        });
    });
};



app.put('/broker/requests/:propertyId/:seekerId', verifyToken, async (req, res) => {
    const username = req.user.username;
    if (req.user.role != "broker") {
        return res.status(400).json({ error: 'Not authorized to update requests' });
    }
    try {

        // Extract request parameters from the URL
        const { propertyId, seekerId } = req.params;

        // Extract request details from the request body
        const { intent, isComplete, approvedRejectedInt } = req.body;

        const contactId = await getContactIdByUsername(username);

        // Call the UpdateRequestDetails function
        const requestStatus = await updateRequestDetails(propertyId, seekerId, contactId, intent, isComplete, approvedRejectedInt);
        console.log(requestStatus);
        // Respond with the updated request status
        res.status(200).json({ message: `Request ${requestStatus}` });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json(error);
    }
});

// Endpoint for handling property purchase
app.post('/:propertyId/buy', verifyToken, async (req, res) => {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.body;
    const username = req.user.username;

    if (req.user.role != "user") {
        return res.status(400).json({ error: 'Not authorized to buy/rent property' });
    }

    try {
        const seeker_id = await getCustomerIdByUsername(username);
        // Call the stored procedure to add the property to the seeker's list
        db.query('CALL Add_Property_Seeker_Property(?, ?, ?, ?)', [seeker_id, propertyId, startDate, endDate], (err, results) => {
            if (err) {
                // Handle database errors
                console.error('Error buying property:', err);
                return res.status(500).json(err);
            }

            // Check if the procedure executed successfully
            if (results && results.affectedRows > 0) {
                // Property successfully purchased
                return res.status(200).json({ message: 'Property purchased successfully.' });
            } else {
                // Property purchase failed (possible invalid property ID)
                return res.status(400).json({ message: 'Failed to buy property. Please check the provided data.' });
            }
        });
    } catch {
        res.status(500).json(error);
    }
});


app.get('/property-details/:propertyId', verifyToken, (req, res) => {
    const { propertyId } = req.params;
    // Call the Read_Property_Seeker_Property procedure
    db.query('CALL Read_Property_Seeker_Property(?, ?)', [userId, propertyId], (err, results) => {
        if (err) {
            console.error('Error retrieving property details:', err);
            return res.status(500).json({ message: 'Failed to fetch property details. Please try again later.' });
        }

        // Check if the procedure returned any results
        if (results && results.length > 0 && results[0].length > 0) {
            const propertyDetails = results[0][0]; // Assuming the first result is the property details
            res.status(200).json(propertyDetails);
        } else {
            res.status(404).json({ message: 'Property not found or you do not have permission to view this property.' });
        }
    });
});

app.get('/amenities/:areaName', verifyToken, async (req, res) => {
    const { areaName } = req.params;

    try {
        db.query('CALL List_Amenities_By_Area(?)', [areaName], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err.sqlMessage);
            }
            res.status(200).json(results[0]);
        });
        
    } catch (error) {
        console.error('Error listing amenities:', error);
        res.status(500).json({ message: 'Failed to list amenities. Please try again later.' });
    }
});

app.get('/crimes/:areaName', verifyToken, async (req, res) => {
    const { areaName } = req.params;
    console.log(areaName);

    try {
        db.query('CALL List_Crimes_By_Area_Name(?)', [areaName], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err.sqlMessage);
            }
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error listing crimes:', error);
        res.status(500).json({ message: 'Failed to list crimes. Please try again later.' });
    }
});






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});