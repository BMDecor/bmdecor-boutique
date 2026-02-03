import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';

const credentials = fromIni({ profile: 'bmdecor' });
const client = new DynamoDBClient({ region: 'eu-west-1', credentials });
const docClient = DynamoDBDocumentClient.from(client);

async function purge() {
  console.log('═'.repeat(60));
  console.log('TOTAL PURGE: Deleting all BM items from BmDecorProducts');
  console.log('═'.repeat(60));

  let totalDeleted = 0;
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const scanResult = await docClient.send(new ScanCommand({
      TableName: 'BmDecorProducts',
      FilterExpression: 'brand = :brand',
      ExpressionAttributeValues: { ':brand': 'BM' },
      ExclusiveStartKey: lastEvaluatedKey,
    }));

    const items = scanResult.Items || [];
    console.log(`Found ${items.length} BM items in this batch...`);

    for (const item of items) {
      await docClient.send(new DeleteCommand({
        TableName: 'BmDecorProducts',
        Key: { PK: item.PK, SK: item.SK }
      }));
      totalDeleted++;
      if (totalDeleted % 100 === 0) {
        console.log(`  Deleted: ${totalDeleted}...`);
      }
    }

    lastEvaluatedKey = scanResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log('═'.repeat(60));
  console.log(`✓ PURGE COMPLETE: ${totalDeleted} BM items deleted`);
  console.log('═'.repeat(60));

  // Verify empty
  const verifyResult = await docClient.send(new ScanCommand({
    TableName: 'BmDecorProducts',
    FilterExpression: 'brand = :brand',
    ExpressionAttributeValues: { ':brand': 'BM' },
    Select: 'COUNT'
  }));
  console.log(`Verification: ${verifyResult.Count} BM items remaining`);
}

purge().catch(console.error);
