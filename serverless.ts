import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'serverless-todos-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dynamodb-local', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: {
    createTodoItem: {
      handler: "src/functions/createTodoItem.handler",
      events: [
        {
          http: {
            path: "/todos/{userid}",
            method: "post",
            cors: true
          }
        }
      ]
    },
    getUsersTodos: {
      handler: "src/functions/getUsersTodos.handler",
      events: [
        {
          http: {
            path: "/todos/{userid}",
            method: "get",
            cors: true
          }
        }
      ]
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      }
    }
  },
  resources: {
    Resources: {
      dbTodoItems: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "todo_items",
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            },
            {
              AttributeName: "user_id",
              AttributeType: "S"
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "UserIdIndex",
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
              KeySchema: [
                {
                  AttributeName: "user_id",
                  KeyType: "HASH"
                }
              ],
              Projection: {
                ProjectionType: "ALL"
              }
            }
          ]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
