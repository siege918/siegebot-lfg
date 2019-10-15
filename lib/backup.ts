import { Credentials, S3 } from 'aws-sdk';

import * as Constants from './constants';
import GroupCache from './GroupCache';

const accessKeyID = process.env[Constants.S3_ACCESS_KEY_ENV] || '';
const secretAccessKey = process.env[Constants.S3_SECRET_ENV] || '';
const bucketName = process.env[Constants.S3_BUCKET_ENV] || '';
const region = process.env[Constants.S3_REGION_ENV] || 'us-west-2';

let s3: S3;

if (accessKeyID && secretAccessKey && bucketName) {
  s3 = new S3({
    region,
    credentials: new Credentials(accessKeyID, secretAccessKey)
  });
} else if (process.env.NODE_ENV === 'development') {
  s3 = new S3({ region });
}

export async function restore(groupCache: GroupCache) {
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

async function restoreBackupByName(
  groupCache: GroupCache,
  latestBackupName: string
) {
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

export async function backup(groupCache: GroupCache) {
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

async function markFileAsLatest(fileName: string) {
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
