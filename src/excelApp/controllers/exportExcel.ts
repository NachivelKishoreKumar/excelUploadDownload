import excel from "excel4node";
import {dbToFile} from "../db";
export const exportDBToExcel = async () => {
    let extractedArray :any[]=[];
    let selectQuery = `select * FROM Employee`;
    const extractedResults = await dbToFile(selectQuery);
    let extractedJson = JSON.stringify(extractedResults);
    const extractedData = JSON.parse(extractedJson);
    for (let i in extractedData){
      extractedArray.push([
        extractedData[i].ID,
        extractedData[i].NAME,
        extractedData[i].DEPARTMENT,
        extractedData[i].ACTIVE,
        extractedData[i].GENDER,
        extractedData[i].ROLE_ID,
        extractedData[i].ACTIVE_FROM,
      ])
    }
    let workBook = new excel.Workbook({ dateFormat: "mm/dd/yyyy" });
    let workSheet = workBook.addWorksheet("Sheet1");
    const headers = [
      "ID",
      "NAME",
      "DEPARTMENT",
      "ACTIVE",
      "GENDER",
      "ROLE_ID",
      "ACTIVE_FROM",
    ];
    for (let k = 0; k < headers.length; k++) {
      workSheet.cell(1, k + 1).string(headers[k]);
    }
    let startRow = 2;
    for (let i = 0; i < extractedArray.length; i++) {
      for (let j = 0; j < extractedArray[i].length; j += 7) {
        workSheet.cell(startRow + i, 1).string(extractedArray[i][j]);
        workSheet.cell(startRow + i, 2).string(extractedArray[i][j + 1]);
        workSheet.cell(startRow + i, 3).string(extractedArray[i][j + 2]);
        workSheet.cell(startRow + i, 4).number(extractedArray[i][j + 3]);
        workSheet.cell(startRow + i, 5).string(extractedArray[i][j + 4]);
        workSheet.cell(startRow + i, 6).string(extractedArray[i][j + 5]);
        workSheet.cell(startRow + i, 7).date(extractedArray[i][j + 6]);
      }
    }
    const exportBuffers = await workBook.writeToBuffer();
  
    return {
      statusCode: 200,
      headers: {
        "Content-type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="test.xlsx"`,
      },
      isBase64Encoded: true,
      body: JSON.stringify(exportBuffers.toString("base64")),
    };
  };
  