package com.tests.steps;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tests.utils.MyUtils;
import io.cucumber.java.PendingException;
import io.cucumber.java.en.*;
import io.restassured.module.jsv.JsonSchemaValidator;
import io.restassured.response.Response;
import com.aventstack.extentreports.cucumber.adapter.ExtentCucumberAdapter;
import io.cucumber.java.After;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.Assert.*;

public class StepDefinitions {

    private Response response;
    private String extractedEmail;
    private String updatedName;
    private String updatedEmail;
    private int updatedAge;
    private String lastResponseBody;
    private String secondExtractedEmail;

    @When("I send a GET request to {string}")
    public void iSendAGetRequest(String path) {
        response = MyUtils.get(path);
    }

    @When("I send a GET request with extracted email to {string}")
    public void iSendGetRequestWithEmail(String basePath) {
        response = MyUtils.get(basePath + extractedEmail);
    }

    @When("I send a POST request to {string} with body:")
    public void iSendAPostRequest(String path, String body) {
        String randomEmail = "e2e_test_" + UUID.randomUUID().toString().substring(0, 10) + "@example.com";

        String dynamicBody = body.replace("{{randomEmail}}", randomEmail);

        System.out.println("Generated email: " + randomEmail);
        response = MyUtils.post(path, dynamicBody);
    }

    @Then("the response status code should be {int}")
    public void theResponseStatusCodeShouldBe(int statusCode) {
        assertEquals(statusCode, response.getStatusCode());
    }

    @Then("the response body contains {string}")
    public void theResponseBodyContains(String expectedValue) {
        assertTrue(response.getBody().asString().contains(expectedValue));
    }

    @Then("the response time is less than {int} milliseconds")
    public void theResponseTimeIsLessThan(int ms) {
        assertTrue(response.getTime() < ms);
    }

    @And("show response")
    public void showResponse() {
        String body = response.getBody().asPrettyString();
        int status = response.getStatusCode();
        long time = response.getTime();

        response.then().log().all();

        ExtentCucumberAdapter.getCurrentStep().info("Status Code: " + status);
        ExtentCucumberAdapter.getCurrentStep().info("Response Time: " + time + "ms");
        ExtentCucumberAdapter.getCurrentStep().info("<pre>" + body + "</pre>");
    }

    @When("I send a GET request to {string} {string}")
    public void iSendAGETRequestTo(String path, String email) {
        String fullPath = path + '/' + email;
        response = MyUtils.get(fullPath);
    }

    @And("I extract the email from the first user")
    public void iExtractTheEmailFromTheFirstUser() {
        extractedEmail = response.jsonPath().getString("[0].email");
        System.out.println("Extracted email: " + extractedEmail);
    }

    @And("I validate each user has required fields")
    public void iValidateEachUserHasRequiredFields() {
        List<Map<String, Object>> users = response.jsonPath().getList("$");

        System.out.println("Total users found: " + users.size());

        for (Map<String, Object> user : users) {
            System.out.println("Validating user: " + user.get("name"));

            assertNotNull("age is missing",    user.get("age"));
            assertNotNull("Email is missing",  user.get("email"));
            assertNotNull("Name is missing", user.get("name"));
        }
    }

    @When("I send a POST request to {string}")
    public void iSendAPOSTRequestTo(String path, String body) {
        response = MyUtils.post(path, body);
    }

    @When("I send a DELETE request to {string} {string}")
    public void iSendADELETERequestTo(String path, String email) {
        String fullPath = path + email;
        response = MyUtils.deleteWithAuth(fullPath);
    }

    @When("I send a DELETE with extracted email to {string}")
    public void iSendADELETEWithExtractedEmailTo(String basePath) {
        response = MyUtils.deleteWithAuth(basePath + extractedEmail);
    }

    @When("I send a PUT request with extracted email to {string} with body:")
    public void iSendAPUTRequestWithExtractedEmailToWithBody(String basePath, String body) throws JsonProcessingException {
        String resolvedBody = body;

        if (extractedEmail != null && resolvedBody.contains("{{currentEmail}}"))
            resolvedBody = resolvedBody.replace("{{currentEmail}}", extractedEmail);

        if (extractedEmail != null && resolvedBody.contains("{{firstUserEmail}}"))
            resolvedBody = resolvedBody.replace("{{firstUserEmail}}", extractedEmail);

        if (secondExtractedEmail != null && resolvedBody.contains("{{secondUserEmail}}"))
            resolvedBody = resolvedBody.replace("{{secondUserEmail}}", secondExtractedEmail);

        String fullPath = basePath + (secondExtractedEmail != null ? secondExtractedEmail : extractedEmail);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode payload = mapper.readTree(resolvedBody);

        updatedName  = payload.get("name").asText();
        updatedEmail = payload.get("email").asText();
        updatedAge   = payload.get("age").asInt();

        response = MyUtils.put(fullPath, resolvedBody);
    }

    @And("the update is part of response")
    public void theUpdateIsPartOfResponse() {
        String responseName  = response.jsonPath().getString("name");
        String responseEmail = response.jsonPath().getString("email");
        int responseAge = response.jsonPath().getInt("age");

        assertEquals("Name mismatch",  updatedName,  responseName);
        assertEquals("Email mismatch", updatedEmail, responseEmail);
        assertEquals("Age mismatch", updatedAge, responseAge);
    }

    @And("I extract the email from the response")
    public void iExtractTheEmailFromTheResponse() {
        extractedEmail = response.jsonPath().getString("email");
        System.out.println("Extracted email: " + extractedEmail);
    }

    @When("I send a POST request to {string} with name {string} email {string} and age {string}")
    public void iSendAPOSTRequestToWithNameEmailAndAge(String path, String name, String email, String age) {
        String body = String.format("""
        {
          "name": "%s",
          "email": "%s",
          "age": %s
        }
        """, name, email, age);

        response = MyUtils.post(path, body);
    }

    @And("the error schema is matching")
    public void theErrorSchemaIsMatching() {
        response.then().assertThat().body(
                JsonSchemaValidator.matchesJsonSchemaInClasspath("schemas/badRequest.json")
        );
    }

    @And("the response body does not expose stack trace")
    public void theResponseBodyDoesNotExposeStackTrace() {
        String body = response.getBody().asString().toLowerCase();

        assertFalse("Stack trace exposed!", body.contains("stack trace"));
        assertFalse("Exception exposed!",   body.contains("exception"));
        assertFalse("SQL error exposed!",   body.contains("sql"));
        assertFalse("Server error exposed!", body.contains("at com."));
        assertFalse("Internal path exposed!", body.contains("/usr/"));

        ExtentCucumberAdapter.getCurrentStep().info("No sensitive data exposed");
    }

    @When("I send a DELETE request without auth to {string}")
    public void iSendDeleteWithoutAuth(String basePath) {
        response = MyUtils.deleteNoAuth(basePath + extractedEmail);
    }

    @After("@cleanup")
    public void tearDown() {
        if (extractedEmail != null && !extractedEmail.isEmpty()) {
            Response deleteResponse = MyUtils.deleteWithAuth("/users/" + extractedEmail);

            int status = deleteResponse.getStatusCode();
            if (status == 204 || status == 404) {
                System.out.println("Teardown Ok: " + status);
            } else {
                System.out.println("Unexpected teardown status: " + status);
            }
            extractedEmail = null;
        }

        if (secondExtractedEmail != null && !secondExtractedEmail.isEmpty()) {
            Response delete = MyUtils.deleteWithAuth("/users/" + secondExtractedEmail);
            System.out.println("Teardown user 2: " + secondExtractedEmail);
            secondExtractedEmail = null;
        }
    }

    @When("I send a PUT request to {string} with name {string} email {string} and age {string}")
    public void iSendAPUTRequestToWithNameNameEmailEmailAndAgeAge(String path, String name, String email, String age) {
        String fullPath = path + extractedEmail;

        String body = String.format("""
        {
          "name": "%s",
          "email": "%s",
          "age": %s
        }
        """, name, email, age);

        response = MyUtils.put(fullPath, body);
    }

    @And("I store the response body")
    public void iStoreTheResponseBody() {
        lastResponseBody = response.getBody().asString();
    }

    @And("the response is identical to previous")
    public void theResponseIsIdenticalToPrevious() {
        String currentBody = response.getBody().asString();
        assertEquals("Response mismatch, PUT not idempotent!", lastResponseBody, currentBody);
    }

    @And("I store the second user email")
    public void iStoreTheSecondUserEmail() {
        secondExtractedEmail = response.jsonPath().getString("email");
        System.out.println("Second user email: " + secondExtractedEmail);
    }
}