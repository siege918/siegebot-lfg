'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const aws_sdk_1 = require('aws-sdk');
const Constants = require('./constants');
const accessKeyID = process.env[Constants.S3_ACCESS_KEY_ENV] || '';
const secretAccessKey = process.env[Constants.S3_SECRET_ENV] || '';
const bucketName = process.env[Constants.S3_BUCKET_ENV] || '';
const region = process.env[Constants.S3_REGION_ENV] || 'us-west-2';
let S3Client;
if (accessKeyID && secretAccessKey && bucketName) {
  S3Client = new aws_sdk_1.S3({
    region,
    credentials: new aws_sdk_1.Credentials(accessKeyID, secretAccessKey)
  });
}
function restore(groupCache) {
  if (!S3Client) return;
  S3Client.getObject(
    {
      Bucket: bucketName,
      Key: 'latest-lfg-backup'
    },
    (err, data) => {
      if (err) {
        console.warn(err);
      } else {
        let body = data.Body || '';
        var latestBackupName = body.toString().trim();
        if (latestBackupName) {
          restoreBackupByName(groupCache, latestBackupName);
        }
      }
    }
  );
}
exports.restore = restore;
function restoreBackupByName(groupCache, latestBackupName) {
  S3Client.getObject(
    {
      Bucket: bucketName,
      Key: latestBackupName
    },
    (err, data) => {
      if (err) {
        console.warn(err);
      } else {
        let body = data.Body || '';
        var latestBackup = body.toString().trim();
        if (latestBackup) {
          groupCache.import(latestBackup);
        }
      }
    }
  );
}
function backup(groupCache) {
  if (!S3Client) return;
  let backupDate = new Date();
  let backupName = `LFG_${backupDate.toISOString()}.json`;
  console.log(groupCache);
  console.log(groupCache.export());
  S3Client.upload(
    {
      Bucket: bucketName,
      Key: backupName,
      Body: groupCache.export()
    },
    (err, data) => {
      if (err) {
        console.warn('Error marking backup file as latest.');
        console.warn(err);
      } else {
        console.log(`File ${backupName} has been uploaded to ${bucketName}`);
        markFileAsLatest(backupName);
      }
    }
  );
}
exports.backup = backup;
function markFileAsLatest(fileName) {
  S3Client.upload(
    {
      Bucket: bucketName,
      Key: 'latest-lfg-backup',
      Body: fileName
    },
    (err, data) => {
      if (err) {
        console.warn('Error marking backup file as latest.');
        console.warn(err);
      } else {
        console.log(
          `File ${fileName} has been marked as latest in bucket ${bucketName}`
        );
      }
    }
  );
}
