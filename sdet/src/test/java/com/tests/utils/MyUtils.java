package com.tests.utils;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import static io.restassured.RestAssured.*;

public class MyUtils {

    private static final String BASE_URL = System.getenv("BASE_URL") != null
            ? System.getenv("BASE_URL")
            : "http://localhost:3000/dev/";

    public static RequestSpecification getRequest() {
        return given()
                .baseUri(BASE_URL)
                .header("Content-Type", "application/json");
    }

    public static Response get(String path) {
        return getRequest().when().get(path);
    }

    public static Response post(String path, Object body) {
        return getRequest().body(body).when().post(path);
    }

    public static Response put(String path, Object body) {
        return getRequest().body(body).when().put(path);
    }

    public static Response delete(String path) {
        return getRequest().when().delete(path);
    }
}