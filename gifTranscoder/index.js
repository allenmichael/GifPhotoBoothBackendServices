console.log('Loading function');

const aws = require('aws-sdk');

const s3 = new aws.S3({
  apiVersion: '2006-03-01'
});
const pipelineId = '1528327351301-fpvqs4';
const eltr = new aws.ElasticTranscoder({
  apiVersion: '2012-09-25',
  region: 'us-west-2'
});


exports.handler = async (event, context) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));

  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const params = {
    Bucket: bucket,
    Key: key,
  };
  try {
    const {
      ContentType
    } = await s3.getObject(params).promise();
    console.log('CONTENT TYPE:', ContentType);
    const etParams = {
      PipelineId: pipelineId,
      Input: {
        Key: key,
        FrameRate: 'auto',
        Resolution: 'auto',
        AspectRatio: 'auto',
        Interlaced: 'auto',
        Container: 'auto'
      },
      Outputs: [{
        Key: key + '.gif',
        ThumbnailPattern: key + '-{count}',
        PresetId: '1351620000001-100200', //Gif
      }]
    }
    try {
      const result = await eltr.createJob(etParams).promise();
      console.log(result);
    } catch (e) {
      console.log("Something went wrong when creating job...");
      console.log(e);
    }


    return ContentType;
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    console.log(message);
    throw new Error(message);
  }
};
