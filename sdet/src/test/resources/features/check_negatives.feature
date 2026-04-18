@full-regression
Feature: API Validation, Basic Negative Tests

  Scenario Outline: Validate POST Action, Create User Invalid Payload, <desc>
    When I send a POST request to "/users" with name '<name>' email '<email>' and age '<age>'
    Then the response status code should be <status>
    And show response
    And the error schema is matching

    Examples:
      | name  | email    | age | status | desc          |
      |       | mail.com | 10  | 400    | blank name    |
      | test  |          | 10  | 400    | blank email   |
      | doe   | mail.com | abc | 400    | string age    |
      |       |          |     | 400    | all blanks    |
      | doe   | mail.com | 0   | 400    | low boundary  |
      | doe   | mail.com | 151 | 400    | high boundary |

  @cleanup
  Scenario: Validate POST Action, Check For Conflicts
    When I send a POST request to "/users" with body:
      """
      {
        "name": "test_conflict_repeated",
        "email": "test_conflict_repeated",
        "age": 1
      }
      """
    Then the response status code should be 201
    And I extract the email from the response

    When I send a POST request to "/users" with body:
      """
      {
        "name": "test_conflict_repeated",
        "email": "test_conflict_repeated",
        "age": 1
      }
      """
    Then the response status code should be 409