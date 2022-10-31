import { APIGatewayEventRequestContextWithAuthorizer, APIGatewayEventDefaultAuthorizerContext } from "aws-lambda";
import { exportDBToExcel} from "./controllers/exportExcel";
import { getExcelData } from "./controllers/importExcel";

export const router=async(path: string,requestMethod: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,eventBody: string | null)=>{
    if (requestMethod.httpMethod === "POST" && path==="/upload") {
        const controllerResponse = await getExcelData(eventBody);
        return controllerResponse
      
    }
    if (requestMethod.httpMethod === "GET" && path==="/download") {
        const controllerResponse = await exportDBToExcel();
        return controllerResponse
      
    }
}