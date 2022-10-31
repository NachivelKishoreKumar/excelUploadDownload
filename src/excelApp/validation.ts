const Joi = require("joi");

let employeeArray: any[] = [];
let errorArray: any[] = [];

export const validateData = async (employeeData) => {
  const schema = Joi.object({
    ID: Joi.string().required(),
    NAME: Joi.string()
      .pattern(/^[a-z A-Z ]*$/)
      .required(),
    DEPARTMENT: Joi.string().required(),
    ACTIVE: Joi.string().valid(0, 1).required(),
    GENDER: Joi.string().valid("M", "F").required(),
    ROLE_ID: Joi.string().required(),
    ACTIVE_FROM: Joi.date().required(),
  }).options({ abortEarly: false });

  for(let i in employeeData){
    await valid(schema,employeeData[i])
  }

  return({errors:errorArray,employee:employeeArray})
 
}

const valid=async(schema,employee)=>{
    let result = await schema.validate(employee);
    if (result.error) {
      errorArray.push({ID : employee.ID,error : result.error.message})
      //console.log(result.error.message);
    } 
    else {
      employeeArray.push([
        employee.ID,
        employee.NAME,
        employee.DEPARTMENT,
        employee.ACTIVE,
        employee.GENDER,
        employee.ROLE_ID,
        employee.ACTIVE_FROM,
      ]);
    }
}
