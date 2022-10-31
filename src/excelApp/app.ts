import { APIGatewayProxyEvent} from "aws-lambda";
import { router } from "./router";

export const lambdaHandler = async (event: APIGatewayProxyEvent) => {

  try{
  const eventOutput = await router(event.path,event.requestContext,event.body)
  return eventOutput
  }
  catch(error){
    return {
      statusCode: 400,
      body: JSON.stringify(error)
    };
  }
};
