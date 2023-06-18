import mongoose from "mongoose";
import express from "express";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { AppModule } from "./app.module";

let mongo: any = null;
let app: AppModule;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  app = new AppModule(express(), uri);
  await app.start();
});

afterAll(async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
});

const dropCollections = async () => {
  if (mongo) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany();
    }
  }
};

const register = async () => {
  return await request(app.app).post("/api/auth/register").send({
    email: "test1234@gmail.com",
    password: "samplepassword",
  });
};

describe("Auth routes", () => {
  beforeEach(async () => {
    await dropCollections();
  });

  describe("Register", () => {
    it("should register new user", async () => {
      const response = await request(app.app).post("/api/auth/register").send({
        email: "test1234@gmail.com",
        password: "samplepassword",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("should not register user without email", async () => {
      const response = await request(app.app).post("/api/auth/register").send({
        password: "samplepassword",
      });
      expect(response.body.errors.length).toBe(2);
      expect(response.status).toBe(400);
    });

    it("should not register user with wrong email", async () => {
      const response = await request(app.app).post("/api/auth/register").send({
        email: "test3gmail.com",
        password: "samplepassword",
      });
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe("a valid email is required");
      expect(response.status).toBe(400);
    });

    it("should not register user without password", async () => {
      const response = await request(app.app).post("/api/auth/register").send({
        email: "test1234@gmail.com",
      });
      expect(response.body.errors.length).toBe(2);
      expect(response.status).toBe(400);
    });

    it("should not register user with to short password", async () => {
      const response = await request(app.app).post("/api/auth/register").send({
        email: "test3@gmail.com",
        password: "sam",
      });
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        "a valid password is required"
      );
      expect(response.status).toBe(400);
    });

    it("should not register user when there is no body", async () => {
      const response = await request(app.app)
        .post("/api/auth/register")
        .send({});
      expect(response.body.errors.length).toBe(4);
      expect(response.status).toBe(400);
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      await register();
      const response = await request(app.app).post("/api/auth/login").send({
        email: "test1234@gmail.com",
        password: "samplepassword",
      });

      const cookie = response.get("Set-Cookie");
      expect(cookie).not.toContain("expires=");
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("should not login a user when password is wrong", async () => {
      await register();
      const response = await request(app.app).post("/api/auth/login").send({
        email: "test1234@gmail.com",
        password: "samplepassword1",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe("Wrong credentials");
    });

    it("should not login a user when there is no user with provided email", async () => {
      await register();
      const response = await request(app.app).post("/api/auth/login").send({
        email: "nouser@gmail.com",
        password: "samplepassword1",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe("Wrong credentials");
    });

    it("should not login when wrong email format provided", async () => {
      await register();
      const response = await request(app.app).post("/api/auth/login").send({
        email: "test1234gmail.com",
        password: "samplepassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe("a valid email is required");
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      await register();
      const response = await request(app.app)
        .get("/api/auth/logout")
        .expect(200);

      const cookies = response.get("Set-Cookie");
      const expiresCookie = cookies.find((cookie: string) =>
        cookie.includes("expires=")
      );
      expect(expiresCookie).toMatch(/expires=/);
    });
  });
});

describe("Users routes", () => {
  let cookie: any;

  beforeEach(async () => {
    await dropCollections();

    const response = await register();
    expect(response.status).toBe(201);
    cookie = response.get("Set-Cookie");
  });

  describe("Get All Users", () => {
    it("should get all users", async () => {
      const response = await request(app.app)
        .get("/api/users")
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should get all users with role=user", async () => {
      const response = await request(app.app)
        .get("/api/users")
        .query({ role: "user" })
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should get all users with role=admin", async () => {
      const response = await request(app.app)
        .get("/api/users")
        .query({ role: "admin" })
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe("Create User", () => {
    it("should create a new user", async () => {
      const response = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({
          firstName: "Test First",
          lastName: "Test Last",
          email: "testuser@example.com",
          role: "user",
        })
        .expect(201);

      expect(response.body).toBeDefined();
    });

    it("should not create user without required fields", async () => {
      const response = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({})
        .expect(400);

      expect(response.body.errors.length).toBe(3);
    });

    it("should not create user without required email", async () => {
      const response = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({
          firstName: "test name",
          lastName: "test last",
          role: "user",
        })
        .expect(400);

      expect(response.body.errors.length).toBe(2);
    });

    it("should not create user without required role", async () => {
      const response = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({
          firstName: "test name",
          lastName: "test last",
          email: "test123@test.com",
        })
        .expect(400);

      expect(response.body.errors.length).toBe(1);
    });

    it("should not create user with wrong role", async () => {
      const response = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({
          firstName: "test name",
          lastName: "test last",
          email: "test123@test.com",
          role: "userr",
        })
        .expect(400);

      expect(response.body.errors.length).toBe(1);
    });
  });

  describe("Update User", () => {
    let userId: string;

    beforeEach(async () => {
      const createUserResponse = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({
          firstName: "Test First",
          lastName: "Test Last",
          email: "testuser@example.com",
          role: "user",
        })
        .expect(201);

      userId = createUserResponse.body._id;
      expect(userId).toBeDefined();
    });

    it("should update a user", async () => {
      const response = await request(app.app)
        .patch(`/api/user/${userId}`)
        .set("Cookie", cookie)
        .send({
          lastName: "Updated Last Name",
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should not update user with no data", async () => {
      const response = await request(app.app)
        .patch(`/api/user/${userId}`)
        .set("Cookie", cookie)
        .send({})
        .expect(400);

      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].message).toBe(
        "You should provide at least one property"
      );
    });

    it("should not update user with wrong role", async () => {
      const response = await request(app.app)
        .patch(`/api/user/${userId}`)
        .set("Cookie", cookie)
        .send({
          lastName: "Updated Last Name",
          role: "adminer",
        })
        .expect(400);

      expect(response.body.errors.length).toBe(1);
    });

    it("should not update non-existing user", async () => {
      const response = await request(app.app)
        .patch("/api/user/648e10c5453611c8d3c4dc11")
        .set("Cookie", cookie)
        .send({
          lastName: "Updated Last Name",
        })
        .expect(404);

      expect(response.body.errors.length).toBe(1);
    });
  });

  describe("Get One User", () => {
    let userId: string;

    beforeEach(async () => {
      const createUserResponse = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({
          firstName: "Test First",
          lastName: "Test Last",
          email: "testuser@example.com",
          role: "user",
        })
        .expect(201);

      userId = createUserResponse.body._id;
      expect(userId).toBeDefined();
    });

    it("should get one user", async () => {
      const response = await request(app.app)
        .get(`/api/user/${userId}`)
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should not get non-existing user", async () => {
      const response = await request(app.app)
        .get("/api/user/648e10c5453611c8d3c4dc11")
        .set("Cookie", cookie)
        .expect(404);

      expect(response.body.errors.length).toBe(1);
    });
  });

  describe("Delete User", () => {
    let userId: string;

    beforeEach(async () => {
      const createUserResponse = await request(app.app)
        .post("/api/user")
        .set("Cookie", cookie)
        .send({
          firstName: "Test First",
          lastName: "Test Last",
          email: "testuser@example.com",
          role: "user",
        })
        .expect(201);

      userId = createUserResponse.body._id;
      expect(userId).toBeDefined();
    });

    it("should delete a user", async () => {
      const response = await request(app.app)
        .delete(`/api/user/${userId}`)
        .set("Cookie", cookie)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should not delete non-existing user", async () => {
      const response = await request(app.app)
        .delete("/api/user/648e10c5453611c8d3c4dc11")
        .set("Cookie", cookie)
        .expect(404);

      expect(response.body.errors.length).toBe(1);
    });
  });
});
