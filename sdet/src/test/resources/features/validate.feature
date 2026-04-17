Feature: API Validation

  Scenario: Validate POST Action, Create User
    When I send a POST request to "/users" with body:
    """
    {
      "name": "GH_Test_Jane_Doe",
      "email": "gh_test_jane@example.com",
      "age": 32
    }
    """
    Then the response status code should be 201
    And show response
    And the response time is less than 400 milliseconds

  Scenario: Validate GET Action, Fetch All Users Data
    When I send a GET request to "/users"
    Then the response status code should be 200
    And show response
    And the response time is less than 400 milliseconds

  Scenario: Validate GET Action, Fetch User By Email
    When I send a GET request to "/users/" "gh_test_jane@example.com"
    Then the response status code should be 200
    And the response time is less than 400 milliseconds

  Scenario: Validate GET Action, Fetch All Users And Pick First One
    When I send a GET request to "/users"
    Then the response status code should be 200
    And I extract the email from the first user
    When I send a GET request with extracted email to "/users/"
    Then the response status code should be 200
    And show response

  Scenario: Validate GET for every user returned
    When I send a GET request to "/users"
    Then the response status code should be 200
    And I validate each user has required fields

  Scenario: Validate GET Action, NotFound User By Email
    When I send a GET request to "/users/" "noResource"
    Then the response status code should be 404
    And the response time is less than 400 milliseconds

  Scenario: Validate DELETE Action, Remove User byEmail
    When I send a DELETE request to "/users/" "gh_test_jane@example.com"
    Then the response status code should be 204
    And the response time is less than 400 milliseconds

  Scenario: Validate DELETE Action, Try To Remove Non-Existing
    When I send a DELETE request to "/users/" "non-existing"
    Then the response status code should be 404