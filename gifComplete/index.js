const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.MOBILE_HUB_PROJECT_REGION
});
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
    // TODO implement
    console.log(event);
    console.log(event.Records[0].Sns);
    if(event && event.Records 
        && event.Records.length > 0 
        && event.Records[0].Sns 
        && event.Records[0].Sns.Message
        && event.Records[0].Sns.Message) {
            console.log(event.Records[0].Sns.Message);
            console.log(event.Records[0].Sns.Message["state"]);
            console.log(event.Records[0].Sns.Message.state);
            const parsed = JSON.parse(event.Records[0].Sns.Message);
            console.log(parsed);
            console.log(parsed.state);
            console.log('slicing...');
            
            const gifFileName = parsed.input.key.slice(parsed.input.key.lastIndexOf('/') + 1, parsed.input.key.length);
            const userId = gifFileName.slice(0, gifFileName.lastIndexOf('-'));
            const gifUrl = parsed.outputs[0].key;
            const params = {
                TableName: process.env.MOBILE_HUB_DYNAMIC_PREFIX + '-gifs',
                Key:{
                    "userId": userId,
                    "gifFileName": gifFileName
                },
                UpdateExpression: "set gifUrl = :url, #status =:s",
                ExpressionAttributeNames: {
                    "#status": "status"
                },
                ExpressionAttributeValues:{
                    ":url": gifUrl,
                    ":s": parsed.state
                },
                ReturnValues:"UPDATED_NEW"
                
            }
            const result = await docClient.update(params).promise();
            console.log(result);
            return;
            } else {
                return;
            }
}
