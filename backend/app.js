'use strict'
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()
const router = express.Router()
const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.MOBILE_HUB_PROJECT_REGION
});
const docClient = new AWS.DynamoDB.DocumentClient();

router.use(compression())

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(awsServerlessExpressMiddleware.eventContext())

router.get('/gifs', (req, res) => {
    if (req.query && req.query.userId) {
        console.log(req.query.userId);
        const params = {
            TableName: process.env.MOBILE_HUB_DYNAMIC_PREFIX + '-gifs',
            KeyConditionExpression: "#usr = :usr",
            ExpressionAttributeNames: {
                "#usr": "userId"
            },
            ExpressionAttributeValues: {
                ":usr": req.query.userId
            }
        };
        docClient.query(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                res.sendStatus(500);
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                res.json(data);
            }
        });
    } else {
        res.json({});
    }
});

router.post('/gifs', (req, res) => {
    if (req.body && req.body.gifFileName && req.body.userId) {
        console.log(req.body);
        console.log(req.body.userId);
        console.log(req.body.gifFileName);
        const params = {
            TableName: process.env.MOBILE_HUB_DYNAMIC_PREFIX + '-gifs',
            Item: {
                "userId": req.body.userId,
                "gifFileName": req.body.gifFileName,
                "status": "Submitted"
            }
        };
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                res.sendStatus(500);
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                res.sendStatus(201);
            }
        });
    } else {
        res.sendStatus(500);
    }
});

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app