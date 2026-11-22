import request from "supertest";
import app from "../src/app";

describe("JWT Authentication API", () => {
  const testEmail = "test@example.com";
  const testPassword = "Password123";

  let accessToken: string;
  let refreshToken: string;

  // Test user registration
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(testEmail);
    expect(response.body.user.password).toBeUndefined();
  });

  // Reject duplicate registration
  it("should reject duplicate email registration", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(response.status).toBe(409);
  });

  // Test login
  it("should login and return access and refresh tokens", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  // Reject incorrect password
  it("should reject incorrect login credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: testEmail,
        password: "WrongPassword"
      });

    expect(response.status).toBe(401);
  });

  // Test protected profile
  it("should return profile with valid access token", async () => {
    const response = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(testEmail);
  });

  // Reject profile request without token
  it("should reject profile request without access token", async () => {
    const response = await request(app)
      .get("/profile");

    expect(response.status).toBe(401);
  });

  // Test logout
  it("should logout and invalidate the refresh token", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken });

    expect(response.status).toBe(200);

    // Refresh token should no longer work
    const refreshResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(refreshResponse.status).toBe(401);

    // Existing access token should still work
    const profileResponse = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(profileResponse.status).toBe(200);
  });
});