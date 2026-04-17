Feature: API Validation

  Scenario: Validate GET Action, Fetch All Users Data
    When I send a GET request to "/users"
    Then the response status code should be 200
    And show response
    And the response time is less than 200 milliseconds

  Scenario: Validate GET Action, Fetch User By Email
    When I send a GET request to "/users/" "test_jane@example.com"
    Then the response status code should be 200
    And the response time is less than 200 milliseconds

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
    And the response time is less than 200 milliseconds