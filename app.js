const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
const port = process.env.PORT; // 3000 is what we used for local. For Heroku we need to use process.env.PORT. Which is a dynamic port.
require('dotenv').config() // Import and configure dotenv.

// This specifies a static folder "public" for static files.
app.use(express.static("public"));

// This allows us to search body of post for information inputted to be retrieved.
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html")
});

// This is the post infomation being stored from user input.
app.post("/", function (req, res) {

    // Users Fist Name
    const firstName = req.body.fName;

    // Users Last Name
    const lastName = req.body.lName;

    // Users Email
    const email = req.body.email;

    // Mailchimp body parameters. https://mailchimp.com/developer/marketing/api/list-activity/
    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    };

    // Turn data into JSON string.
    const jsonData = JSON.stringify(data);

    // This is your mailchimp audiance list 
    const url = "https://us18.api.mailchimp.com/3.0/lists/" + process.env.LIST_ID; // This is the Audience/List ID in .env See also: https://mailchimp.com/help/find-audience-id/

    const options = {
        method: "POST",
        auth: process.env.API_KEY // This is your string and mailchimp api which is in .env.
    }
    // Send JSON data to mailchimp.
    // https://nodejs.org/api/https.html#httpsrequestoptions-callback
    // https://nodejs.org/api/http.html#httprequestoptions-callback
    // https://mailchimp.com/developer/marketing/guides/create-your-first-audience/#add-a-contact-to-an-audience


    const request = https.request(url, options, function (response) {

        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/failure.html");
        }

        response.on("data", function (data) {
            console.log(JSON.parse(data));
        });
    });

    request.write(jsonData);
    request.end();

});

// On failure page when button is clicked this will redirect to home page.
app.post("/failure", function (req, res) {
    res.redirect("/") // This redirects to home route
});

// port is set for Heroku environment port || allows 3000 or local side as well.
app.listen(port || 3000, function () {
    console.log("Server is running on port " + port);
});