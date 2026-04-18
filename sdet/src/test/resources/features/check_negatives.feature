@full-regression
Feature: API Validation, Basic Negative Tests

  Scenario Outline: Validate POST Action, Create User Invalid Payload, <desc>
    When I send a POST request to "/users" with name '<name>' email '<email>' and age '<age>'
    Then the response status code should be <status>
    And show response
    And the error schema is matching

    Examples:
      | name | email    | age | status | desc              |
      |      | mail.com | 10  | 400    | blank name        |
      | test |          | 10  | 400    | blank email       |
      | doe  | mail.com | abc | 400    | string age        |
      |      |          |     | 400    | all blanks        |
      | doe  | mail.com | -1  | 400    | negative boundary |
      | doe  | mail.com | 0   | 400    | low boundary      |
      | doe  | mail.com | 151 | 400    | high boundary     |

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

  @security
  Scenario Outline: Validate GET Security, Path Param Injection
    When I send a GET request to "/users/<payload>"
    Then the response status code should be <status>
    And the response body does not expose stack trace

    Examples:
      | payload               | status |
      | ' OR '1'='1           | 400    |
      | ; DROP TABLE users;-- | 400    |
      | %00                   | 400    |
      | NULL                  | 400    |
      | undefined             | 400    |
      | 99999999999999999999% | 400    |

  @security
  Scenario Outline: Validate POST Security, Payload Injection
    When I send a POST request to "/users" with name "<name>" email "<email>" and age "<age>"
    Then the response status code should be 400
    And the response body does not expose stack trace

    Examples:
      | name                                                          | email                  | age  |
      | ' OR '1'='1'--                                                | valid@mail.com         | 25   |
      | test                                                          | '; DROP TABLE users;-- | 25   |
      | {"$gt": ""}                                                   | valid@mail.com         | 25   |
      | ${7*7}                                                        | valid@mail.com         | 25   |
      | test                                                          | valid@mail.com         | null |
      | huge naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaame | valid@mail.com         | 25   |