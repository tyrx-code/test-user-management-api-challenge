package com.tests.utils;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import javax.swing.plaf.synth.SynthTextAreaUI;
import java.util.Properties;

import static io.restassured.RestAssured.*;

public class MyUtils {

    private static String BASE_URL = "";

    static {
        String envUrl = System.getenv("BASE_URL");
        if (envUrl != null) {
            BASE_URL = envUrl;
        } else {
            try {
                Properties myProperties = new Properties();
                myProperties.load(MyUtils.class.getClassLoader().getResourceAsStream("config.properties"));

                String env = System.getProperty("env", "dev");
                BASE_URL = myProperties.getProperty(env + ".url");
            } catch (Exception e) {
                BASE_URL = "http://localhost:3000/dev/";
            }
        }
    }

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