# User Management — Sample Test Framework

## Summary
User Management is an API for user data management (crud). In this repo I set the basics for an API test framework. 
### Stack **Java + Cucumber + Maven + RestAssured + + Reporting + GH Actions**.
Run API Validations across `dev` and `prod` environments.

---

## If you want to run local
### Prerequisites and Installations
- Java 17
- Maven
- Docker
- 
### Maven Run, runs everything
```bash
mvn clean test
```

### Maven Run byTag (using this in GH to specify tag)
```bash
mvn clean test -Dcucumber.filter.tags="@health-check"
mvn clean test -Dcucumber.filter.tags="@full-regression"
```

### LOCAL: Maven Run byTag and byEnv
```bash
mvn clean test -Denv=prod -Dcucumber.filter.tags="@prod-smoke"
mvn clean test -Denv=dev -Dcucumber.filter.tags="@full-regression"
```
---

## Current Tags

| Tag                | Description                                            |
|--------------------|--------------------------------------------------------|
| `@health-check`    | Simpler tests for PR checks and stability              |
| `@smoke`           | Core happy path scenarios, including only positives    |
| `@e2e`             | End to end full flow tests, CRUD tests                 |
| `@full-regression` | THe entire test suite                                  |
| `@cleanup`         | Not a selection tag, use it for teardown in some tests |
| `@prod-smoke`      | Production Smoke, simple GETs                          |
 
---

## GH Actions, Workflows

Workflow run is a manual trigger (using workflow-dispatch):
- **How to run**, click on Actions > Select Pipeline > Click RUn Workflow > Select Options
<br>

- **Environment** — "dev" & "prod"
- **Tag** — Which "tag" u want to run
---

## Test Report Summary

After running locally, target folder will be generated per run:

target/extent-report/index.html OR target/cucumber-reports.html
- **Im using Dorny plugin** — To allow TSR Dynamic in every run. Allows more details and has good lookAndFeel.
- **Im using Artifact upload** — To get an html file for each run despite of status. You can download the html file.
- **Im generating a md file at workflow runtime** - To show a quick view of Summary with failed tests.
- **Sample Run** https://github.com/tyrx-code/test-user-management-api-challenge/actions/runs/24624431724/job/72000822987

| Metric      | Value           |
|-------------|-----------------|
| Environment | Development     |
| Tag         | full-regression |
| Total Tests | 40              |
| Failures    | 12              |

---

## Current Bug Report

> Bugs found during exploratory and automated testing of the User Management API.
 
---
### High Level Overview, BUG LIST

| Id  | Name                                                                      | Severity | High Level Desc                                                                                                        | Expecting                         |
|-----|---------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| 001 | Bug_GET_Incorrect_Error_Handling_404s                                     | High     | Every GET Call with non-existing Id throws Server Side Error.                                                          | 404                               |
| 002 | Bug_GET_BaseURL_Incorrect_Error_Handling_404s                             | Medium   | Every GET Call to root base path throws Server Side Error.                                                             | 404 or 403                        |
| 003 | Bug_POST_Repeated_Payloads_Not_Handling_Conflicts                         | High     | If an email is already registered throws Server Side Error.                                                            | 409                               |
| 004 | Bug_POST_Accepting_Invalid_Data_Type_For_Name_Attribute                   | Medium   | Payload attributes are set to be string, string and int, but name accepts boolean, int.                                | 400                               |
| 005 | Bug_POST_Accepting_Invalid_Email_Attribute_Not_Handling_Invalid_Format    | Medium   | Payload attribute email is marked as string, but not validated for format email                                        | 400                               |
| 006 | Bug_POST_Accepting_Invalid_Object_Type_For_Name_Attribute_Security        | High     | Payload attributes are set to be string, string and int, but name accepts objects and turns into ServerSide, insecure. | 400                               |
| 007 | Bug_PUT_Updated_Payload_Not_Persisting                                    | High     | Data Updated not persisting in DB despite of success status.                                                           | 200 and saving data               |
| 008 | Bug_PUT_Accepting_Invalid_Data_Type_For_Name_Attribute                    | Medium   | Payload attributes are set to be string, string and int, but name accepts boolean, int.                                | 400                               |
| 009 | Bug_DELETE_Open_Authorization                                             | High     | API Definition requires Authorization header but we can delete with no auth.                                           | 401 with no token                 |
| 010 | Bug_DELETE_Added_Authorization_And_No_Removal_Completed_In_Prod           | High     | API Definition requires Authorization header, despite of giving right token getting 401s.                              | 401 with no token, 204 with token |
| 011 | Bug_Documentation_Sample_Responses_Attributes_Not_Ordered                 | Low      | When writing tests from Swagger, expecting same order, actual response is alphabetical                                 | Matching schema                   |
| 012 | Bug_Documentation_Sample_Error_Responses_Using_Generic_404_For_All_Errors | Low      | When writing tests from Swagger, expecting clear samples, seeing same 404 for 400, and 409                             | Right Error Message               |
 

## Bug Details:
### Bug_GET_Incorrect_Error_Handling_404s

**Steps to Reproduce:**
1. Create a GET byId Request
2. Add any data-string as pathParam
3. Execute

**Expected Result:** Error properly handled as NotFound with status code 404.

**Actual Result:** Getting Server Side error 500s.

**Evidence**
```json
{
  "error": "Internal server error"
}
```
### Bug_GET_BaseURL_Incorrect_Error_Handling_404s

**Steps to Reproduce:**
1. Create a GET Request
2. Try to access root path /dev/
3. Execute

**Expected Result:** Error properly handled as Forbidden Action OR NotFound with status code 404. Normally in this endpoints we secure the base path with 403s.

**Actual Result:** Getting Server Side error 500s.

**Evidence**
```json
{
  "error": "Internal server error"
}
``` 
### Bug_POST_Repeated_Payloads_Not_Handling_Conflicts

**Steps to Reproduce:**
1. Create a POST Request With Valid Payload and unique email.
2. Execute and get success.
3. Repeat step1 by re-running with exact conditions.
4. Execute

**Expected Result:** Error properly handled as Conflict with status code 409.

**Actual Result:** Getting Server Side error 500s.

**Evidence**
```json
{
  "error": "Internal server error"
}
```
### Bug_POST_Accepting_Invalid_Data_Type_For_Name_Attribute

**Steps to Reproduce:**
1. Create a POST Request With Valid Payload but set incorrect data for Name Attribute: ```json {"name": 1,"email": "my_mail_test_jane@example.com","age": 30}  ```
2. Execute

**Expected Result:** Error properly handled as BadRequest with status code 400.

**Actual Result:** Getting Success Responses, schema definition explicitly mentions name as string.

**Evidence**
```json
{
  "age": 30,
  "email": "my_mail_test_jane@example.com",
  "name": 1
}
```
### Bug_POST_Accepting_Invalid_Email_Attribute_Not_Handling_Invalid_Format

**Steps to Reproduce:**
1. Create a POST Request With Valid Payload but set incorrect data for Name Attribute: ```json {"name": "tomas","email": "invalidMail","age": 30}  ```
2. Execute

**Expected Result:** Error properly handled as BadRequest with status code 400.

**Actual Result:** Getting Success Responses, email format is not validated.

**Evidence**
```json
{
  "age": 30,
  "email": "invalidMail",
  "name": "tomas"
}
```
### Bug_POST_Accepting_Invalid_Object_Type_For_Name_Attribute_Security

**Steps to Reproduce:**
1. Create a POST Request With Valid Payload but set incorrect data for Name Attribute: ```json {"name": {"$gt": ""} ,"email": "valid@mail.com","age": 30}  ```
2. Execute

**Expected Result:** Error properly handled as BadRequest with status code 400.

**Actual Result:** Getting Server Side Errors 500s. We are allowing bad payloads reach backend.

**Evidence**
```json
{
  "error": "Internal server error"
}
```
### Bug_PUT_Updated_Payload_Not_Persisting

**Steps to Reproduce:**
1. Create a PUT Request With Valid Payload and point to existing email: ```json {"name": "UpdatedName" ,"email": "valid@mail.com","age": 40}  ```
2. Execute

**Expected Result:** Success response and data persisting in DB, new changes correctly updated.

**Actual Result:** Getting Success Responses with matching response body, BUT data not being stored in DB.

**Evidence** 
```json
//Put response:
{
  "name": "UpdatedName",
  "email": "valid@mail.com",
  "age": 30
}
```
```json
//Get response:
{
  "name": "tomas",
  "email": "valid@mail.com",
  "age": 30
}
```
### Bug_PUT_Accepting_Invalid_Data_Type_For_Name_Attribute

**Steps to Reproduce:**
1. Create a PUT Request With Valid Payload and point to existing email: ```json {"name": true ,"email": "valid@mail.com","age": 40}  ```
2. Execute

**Expected Result:** Error properly handled as BadRequest with status code 400.

**Actual Result:** Getting Success Responses, schema definition explicitly mentions name as string.

**Evidence**
```json
{
  "name": true,
  "email": "valid@mail.com",
  "age": 30
}
```
### Bug_DELETE_Open_Authorization

**Steps to Reproduce:**
1. Create a DELETE Request With Valid ID But not Valid Authorization.
2. Execute

**Expected Result:** Error properly handled as Unauthorized with status code 401.

**Actual Result:** Getting Success Responses NoContent and id being removed. Auth is missing, all open endpoints.

**Evidence**
```json
NoContent
```
### Bug_DELETE_Added_Authorization_And_No_Removal_Completed_In_Prod

**Steps to Reproduce:**
1. Create a DELETE Request With Valid ID and Valid Authorization.
2. Execute

**Expected Result:** Get Success NoContent and data removal.

**Actual Result:** Getting Unauthorized 401 status, even with right token.

**Evidence**
```json
{
  "error": "Authentication required"
}
```
### Bug_Documentation_Sample_Responses_Attributes_Not_Ordered

**Steps to Reproduce:**
1. Navigate to Swagger and display Unsafe Verbs Post,Put.
2. Check for sample response.
3. Review the schema attributes, all attributes are not ordered.
4. Perform real Post,Put Action and check for Response Body.
5. Actual Response Body shows all attributes alphabetical ordered.

**Expected Result:** Matching between schema, samples and actual response.

**Actual Result:** Minor mismatch between schema, sample and actual response. All attributes displayed but in different order.

**Evidence**
```json
{
  //Swagger
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 30
}
```
```json
{
  //Actual Response
  "age": 30,
  "email": "jane@example.com",
  "name": "Jane Doe"
}
```
### Bug_Documentation_Sample_Error_Responses_Using_Generic_404_For_All_Errors

**Steps to Reproduce:**
1. Navigate to Swagger and display All Verbs.
2. Check for sample error responses for each client error. 
3. Perform real Action with invalid input and check for Error Response Body. 
4. Actual Response Body shows different error message.

**Expected Result:** Matching between schema, samples and actual response.

**Actual Result:** Minor mismatch between schema, sample and actual response. Swagger defines every client side as "notFound".

**Evidence**
```json
{
  //Swagger Error for BadRequest
  "error": "User not found"
}
```
```json
{
  //Swagger Error for Conflict
  "error": "User not found"
}
```
```json
{
  //Actual Error for BadRequest
  "error": "name is required"
}
```
```json
{
  //Actual Error for Conflict
  "error": "Email already exists"
}
```
---