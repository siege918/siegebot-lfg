import { Credentials, S3 } from 'aws-sdk';

import * as Constants from './constants';
import { GroupCache } from './groupCache';

const accessKeyID = process.env[Constants.S3_ACCESS_KEY_ENV] || '';
const secretAccessKey = process.env[Constants.S3_SECRET_ENV] || '';
const bucketName = process.env[Constants.S3_BUCKET_ENV] || '';
const region = process.env[Constants.S3_REGION_ENV] || 'us-west-2';

let S3Client: S3;

if (accessKeyID && secretAccessKey && bucketName) {
  S3Client = new S3({
    region,
    credentials: new Credentials(accessKeyID, secretAccessKey)
  });
} else if (process.env.NODE_ENV === 'development') {
  s3 = new S3({ region });
}

export function restore(groupCache: GroupCache) {
  if (!S3Client) {
    return;
  }

  S3Client.getObject(
    {
      Bucket: bucketName,
      Key: 'latest-lfg-backup'
    },
    (err, data) => {
      if (err) {
        console.warn(err);
      } else {
        const body = data.Body || '';
        const latestBackupName = body.toString().trim();

        if (latestBackupName) {
          restoreBackupByName(groupCache, latestBackupName);
        }
      }
    }
  );
}

function restoreBackupByName(groupCache: GroupCache, latestBackupName: string) {
  S3Client.getObject(
    {
      Bucket: bucketName,
      Key: latestBackupName
    },
    (err, data) => {
      if (err) {
        console.warn(err);
      } else {
        const body = data.Body || '';
        const latestBackup = body.toString().trim();

        if (latestBackup) {
          groupCache.import(latestBackup);
        }
      }
    }
  );
}

export function backup(groupCache: GroupCache) {
  if (!S3Client) {
    return;
  }
  const backupDate = new Date();

  const backupName = `LFG_${backupDate.toISOString()}.json`;
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

function markFileAsLatest(fileName: string) {
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
