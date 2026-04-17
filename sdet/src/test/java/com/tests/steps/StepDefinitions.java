package com.tests.steps;
import com.tests.utils.MyUtils;
import io.cucumber.java.PendingException;
import io.cucumber.java.en.*;
import io.restassured.response.Response;
import com.aventstack.extentreports.cucumber.adapter.ExtentCucumberAdapter;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;

public class StepDefinitions {

    private Response response;
    private String extractedEmail;

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
        response = MyUtils.post(path, body);
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
        extractedEmail = response.jsonPath().getString("[0].email"); // grabs first user's email
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
}