import XLSX from "xlsx";
import { dbToFile, importFileToDb } from "./db";
import { validateData } from "./validation";
import excel from "excel4node";
import lodash from "lodash";

export const getExcelData = async (eventbody: string | null) => {
  const bodyval: any = eventbody;
  const buffer = Buffer.from(bodyval, "base64");
  const bufferArray = JSON.parse(JSON.stringify(buffer));

  const getBufferData = bufferArray.data;

  let excelStringData: string = "";
  let excelArray: string[] = [];
  getBufferData.forEach((dataval: number) => {
    excelArray.push(String.fromCharCode(dataval));
  });
  excelStringData = excelArray.join("");

  const workBook = XLSX.read(excelStringData, {
    type: "binary",
    cellDates: true,
  });

  let excelData;
  const sheetList = workBook.SheetNames;
  const workSheet = workBook.Sheets["Sheet1"];
  
  let flag = false;
  let end: { cell: any; };
  const location = Object.keys(workSheet).map(key=>({...workSheet[key],cell:key}))
  let locationArray = ["ID","NAME","DEPARTMENT","ACTIVE","GENDER","ROLE_ID","ACTIVE_FROM"]
  //[{t,v,b,a,cell}]
  const start = lodash.find(location,function(cell){
    return cell.v==="ID"
  })
  //{t,v,b,a,cell}
  const startingIndex = location.indexOf(start)
  for(let i=0;i<locationArray.length-1;i++){
      if(location[startingIndex+i+1].v===locationArray[i+1]){
        flag= true
      }
    else{
      flag = false
    }}
  if(flag){
    if(location[location.length-1].cell==="!merges"){
    end = location[location.length-3]
    }
    else{
      end = location[location.length-2]
    }
  }
  else{
    return{
      statusCode: 400,
      body: JSON.stringify("File Values Mismatch"),
    };
  }
  workSheet['!ref']=`${start.cell}:${end.cell}`
  const excelSheetData = XLSX.utils.sheet_to_json(workSheet, {
    blankrows: false,
  });
  excelData = JSON.stringify(excelSheetData);

  /*return{
    statusCode : 200,
    body : JSON.stringify(workBook)
  }*/

  return validateExcelData(excelData);
};

export const validateExcelData = async (excelData: string) => {
  const employeeData = JSON.parse(excelData);

  const validatedErrorAndData = await validateData(employeeData);

  let errors = validatedErrorAndData.errors;
  let employeeArray = validatedErrorAndData.employee;

  return await importExcelToDB(employeeArray, errors);
};

export const importExcelToDB = async (employeeArray: any[], errors: any[]) => {
  let insertQuery =
    "INSERT INTO Employee (ID,NAME,DEPARTMENT,ACTIVE,GENDER,ROLE_ID,ACTIVE_FROM) VALUES ?";
  await importFileToDb(employeeArray, insertQuery);
  if (errors.length == 0) {
    return {
      statusCode: 200,
      body: JSON.stringify("File Uploaded Successfully"),
    };
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(errors),
    };
  }
};

export const exportDBToExcel = async () => {
  let selectQuery = `select * FROM Employee`;
  const extractedResults = await dbToFile(selectQuery);
  let extractedJson = JSON.stringify(extractedResults);
  const extractedData = JSON.parse(extractedJson);
  const extractedArray = extractedData.map([
    extractedData.ID,
    extractedData.NAME,
    extractedData.DEPARTMENT,
    extractedData.ACTIVE,
    extractedData.GENDER,
    extractedData.ROLE_ID,
    extractedData.ACTIVE_FROM,
  ]);
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
      
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Methods': "*",
      "Content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="test.xlsx"`,
    },
    isBase64Encoded: true,
    body: JSON.stringify(exportBuffers.toString("base64")),
  };
};
