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
-
- **Environment** — "dev" & "prod"
- **Tag** — Which "tag" u want to run
---

## Test Report Summary

After running locally, target folder will be generated per run:
```
target/extent-report/index.html OR target/cucumber-reports.html
- **Im using Dorny plugin** — To allow TSR Dynamic in every run.
- **Im using Artifact upload** — To get an html file for each run despite of status.
```
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
---