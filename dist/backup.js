'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const aws_sdk_1 = require('aws-sdk');
const Constants = require('./constants');
const accessKeyID = process.env[Constants.S3_ACCESS_KEY_ENV] || '';
const secretAccessKey = process.env[Constants.S3_SECRET_ENV] || '';
const bucketName = process.env[Constants.S3_BUCKET_ENV] || '';
const region = process.env[Constants.S3_REGION_ENV] || 'us-west-2';
let s3;
if (accessKeyID && secretAccessKey && bucketName) {
  s3 = new aws_sdk_1.S3({
    region,
    credentials: new aws_sdk_1.Credentials(accessKeyID, secretAccessKey)
  });
} else if (process.env.NODE_ENV === 'development') {
  s3 = new aws_sdk_1.S3({ region });
}
async function restore(groupCache) {
  if (!s3) {
    return;
  }
  try {
    const data = await s3
      .getObject({ Bucket: bucketName, Key: 'latest-lfg-backup' })
      .promise();
    const body = data.Body || '';
    const latestBackupName = body.toString().trim();
    if (latestBackupName) {
      await restoreBackupByName(groupCache, latestBackupName);
    }
  } catch (err) {
    console.warn(err);
  }
}
exports.restore = restore;
async function restoreBackupByName(groupCache, latestBackupName) {
  try {
    const data = await s3
      .getObject({
        Bucket: bucketName,
        Key: latestBackupName
      })
      .promise();
    const body = data.Body || '';
    const latestBackup = body.toString().trim();
    if (latestBackup) {
      groupCache.import(latestBackup);
    }
  } catch (err) {
    console.warn(err);
  }
}
async function backup(groupCache) {
  if (!s3) {
    return;
  }
  const backupDate = new Date();
  const backupName = `LFG_${backupDate.toISOString()}.json`;
  console.log(groupCache);
  console.log(groupCache.export());
  try {
    await s3
      .upload({
        Bucket: bucketName,
        Key: backupName,
        Body: groupCache.export()
      })
      .promise();
    console.log(`File ${backupName} has been uploaded to ${bucketName}`);
    await markFileAsLatest(backupName);
  } catch (err) {
    console.warn('Error marking backup file as latest.');
    console.warn(err);
  }
}
exports.backup = backup;
async function markFileAsLatest(fileName) {
  try {
    await s3
      .upload({
        Bucket: bucketName,
        Key: 'latest-lfg-backup',
        Body: fileName
      })
      .promise();
    console.log(
      `File ${fileName} has been marked as latest in bucket ${bucketName}`
    );
  } catch (err) {
    console.warn('Error marking backup file as latest.');
    console.warn(err);
  }
}
