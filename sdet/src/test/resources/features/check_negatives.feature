@full-regression
Feature: API Validation, Basic Negative Tests

  Scenario: Validate GET Action, NotFound User By Email
    When I send a GET request to "/users/" "noResource"
    Then the response status code should be 404
    And the response time is less than 400 milliseconds

  Scenario Outline: Validate POST Action, Try To Create User Invalid Payload, <desc>
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
  Scenario Outline: Validate PUT Action, Try To Update User Invalid Payload, <desc>
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

    When I send a PUT request to "/users/" with name '<name>' email '<email>' and age '<age>'
    Then the response status code should be <status>
    And show response
    And the error schema is matching

    Examples:
      | name | email         | age | status | desc              |
      |      | mail.com      | 10  | 400    | blank name        |
      | test |               | 10  | 400    | blank email       |
      | doe  | test@mail.com | abc | 400    | string age        |
      |      |               |     | 400    | all blanks        |
      | doe  | test@mail.com | -1  | 400    | negative boundary |
      | doe  | test@mail.com | 0   | 400    | low boundary      |
      | doe  | test@mail.com | 151 | 400    | high boundary     |
      | doe  | testmail.com  | 45  | 400    | bad format email  |

  @cleanup
  Scenario: Validate PUT Action, Check For Conflict, Update To Existing Mail
    When I send a POST request to "/users" with body:
    """
    {
      "name": "First_User",
      "email": "{{randomEmail}}",
      "age": 30
    }
    """
    Then the response status code should be 201
    And I extract the email from the response

    When I send a POST request to "/users" with body:
    """
    {
      "name": "First_User",
      "email": "{{randomEmail}}",
      "age": 30
    }
    """
    Then the response status code should be 201
    And I store the second user email

    When I send a PUT request with extracted email to "/users/" with body:
    """
    {
      "name": "Second_User",
      "email": "{{firstUserEmail}}",
      "age": 25
    }
    """
    Then the response status code should be 409
    And show response

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

  Scenario: Validate DELETE Action, Requires Authentication
    When I send a POST request to "/users" with body:
    """
    {
      "name": "auth_test_user",
      "email": "auth_test@example.com",
      "age": 25
    }
    """
    Then the response status code should be 201
    And I extract the email from the response

    When I send a DELETE request without auth to "/users/"
    Then the response status code should be 401
    And show response

    When I send a DELETE with extracted email to "/users/"
    Then the response status code should be 204

  @security
  Scenario Outline: Validate GET Security, Path Param Injection, <desc>
    When I send a GET request to "/users/<payload>"
    Then the response status code should be <status>
    And the response body does not expose stack trace

    Examples:
      | payload               | status | desc      |
      | ' OR '1'='1           | 400    | sql 1=1   |
      | ; DROP TABLE users;-- | 400    | sql drop  |
      | %00                   | 400    | space %   |
      | NULL                  | 400    | null      |
      | undefined             | 400    | undefined |
      | 99999999999999999999% | 400    | long %    |

  @security @cleanup
  Scenario Outline: Validate POST Security, Payload Injection, <desc>
    When I send a POST request to "/users" with name "<name>" email "<email>" and age "<age>"
    Then the response status code should be 400
    And the response body does not expose stack trace
    And show response

    Examples:
      | name                                                          | email                  | age  | desc                |
      | test                                                          | '; DROP TABLE users;-- | 25   | sql drop            |
      | test                                                          | valid3@mail.com        | null | null                |
      | huge naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaame | valid4@mail.com        | true | long name n boolean |
      | {"$gt": ""}                                                   | valid5@mail.com        | 25   | inner object        |