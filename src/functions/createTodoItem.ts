import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { document } from "../utils/dynamodbClient";

interface ICreateTodoItem {
    title: string;
    deadline: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
    const { userid } = event.pathParameters;
    const { title, deadline } = JSON.parse(event.body) as ICreateTodoItem;
    const newId = uuidv4();
    await document.put({
        TableName: "todo_items",
        Item: {
            id: newId,
            user_id: userid,
            title,
            done: false,
            deadline,
        }
    }).promise();

    const response = await document.query({
        TableName: "todo_items",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": newId
        }
    }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify(response.Items[0])
    };
}