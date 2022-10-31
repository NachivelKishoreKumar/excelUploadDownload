import mysql from "mysql2";

export const dbConnect = () => {
  const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  });
  connection.connect(function (error) {
    if (error) {
      //console.log("Connection not established");
      return;
    }
    //console.log("Connected to the MySQL server.");
  });
  return connection;
};

export const importFileToDb = async(employeeArray: any[], insertquery: string) => {
 return await new Promise(async (resolve, reject) => {
    const connection = dbConnect();
    connection.query(insertquery, [employeeArray], (error, results) => {
      if (error) {
        reject(error.message);
      } else {
        resolve(results);
        connection.end();
      }
    });
  });
};

export const dbToFile = (selectquery: string) => {
  return new Promise(async (resolve, reject) => {
     const connection = dbConnect();
     connection.query(selectquery,(error, results) => {
       if (error) {
         reject(error.message);
       } else {
         resolve(results);
         }
     });
   });
 
 };
//["E001","RAJKUMAR","D001","1","M","R001","02-01-2015"]
