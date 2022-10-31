import XLSX from "xlsx";
import { importFileToDb } from "../db";
import { validateData } from "../validation";
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
  let end: { cell: any };
  const location = Object.keys(workSheet).map((key) => ({
    ...workSheet[key],
    cell: key,
  }));
  let locationArray = [
    "ID",
    "NAME",
    "DEPARTMENT",
    "ACTIVE",
    "GENDER",
    "ROLE_ID",
    "ACTIVE_FROM",
  ];
  //[{t,v,b,a,cell}]
  const start = lodash.find(location, function (cell) {
    return cell.v === "ID";
  });
  //{t,v,b,a,cell}
  const startingIndex = location.indexOf(start);
  for (let i = 0; i < locationArray.length - 1; i++) {
    if (location[startingIndex + i + 1].v === locationArray[i + 1]) {
      flag = true;
    } else {
      flag = false;
    }
  }
  if (flag) {
    if (location[location.length - 1].cell === "!merges") {
      end = location[location.length - 3];
    } else {
      end = location[location.length - 2];
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify("File Values Mismatch"),
    };
  }
  workSheet["!ref"] = `${start.cell}:${end.cell}`;
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
    "INSERT INTO Employee (ID,NAME,DEPARTMENT,ACTIVE,GENDER,ROLE_ID,ACTIVE_FROM) VALUES ? AS new ON DUPLICATE KEY UPDATE ID = new.ID,NAME=new.NAME,DEPARTMENT=new.DEPARTMENT,ACTIVE=new.ACTIVE,GENDER=new.GENDER,ROLE_ID=new.ROLE_ID,ACTIVE_FROM=new.ACTIVE_FROM";
  //"REPLACE INTO Employee (ID,NAME,DEPARTMENT,ACTIVE,GENDER,ROLE_ID,ACTIVE_FROM) VALUES ?";
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
