@e2e @full-regression
Feature: API Validation, End To End Tests

  Scenario: Validate Full Flow Actions, Create, Get And Delete
    When I send a POST request to "/users" with body:
      """
      {
        "name": "E2E_GH_Test_Jane_Doe",
        "email": "{{randomEmail}}",
        "age": 45
      }
      """
    Then the response status code should be 201

    When I send a GET request to "/users"
    Then the response status code should be 200
    And I extract the email from the first user

    When I send a GET request with extracted email to "/users/"
    Then the response status code should be 200
    And show response

    When I send a DELETE with extracted email to "/users/"
    Then the response status code should be 204

    When I send a GET request with extracted email to "/users/"
    Then the response status code should be 404
    And show response


  Scenario: Validate Full Flow Actions, Create, Get, Update And Delete
    When I send a POST request to "/users" with body:
      """
      {
        "name": "E2E_GH_Test_Jane_Doe",
        "email": "{{randomEmail}}",
        "age": 45
      }
      """
    Then the response status code should be 201
    And I extract the email from the response

    When I send a GET request with extracted email to "/users/"
    Then the response status code should be 200
    And show response
    
    When I send a PUT request with extracted email to "/users/" with body:
      """
      {
        "name": "Updated_Name",
        "email": "updated@mail.com",
        "age": 100
      }
      """
    Then the response status code should be 200
    And show response
    And the update is part of response
    And I extract the email from the response

    When I send a GET request with extracted email to "/users/"
    Then the response status code should be 200
    And show response
    And the update is part of response

    When I send a DELETE with extracted email to "/users/"
    Then the response status code should be 204