import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockAddTestSitePage,
  mockDeleteTestSitePage,
  mockUpdateTestSitePage,
} = vi.hoisted(() => ({
  mockAddTestSitePage: vi.fn(),
  mockDeleteTestSitePage: vi.fn(),
  mockUpdateTestSitePage: vi.fn(),
}));

vi.mock("@/lib/test-site/mutations", () => ({
  addTestSitePage: mockAddTestSitePage,
  deleteTestSitePage: mockDeleteTestSitePage,
  updateTestSitePage: mockUpdateTestSitePage,
}));

import { DELETE, POST, PUT } from "./route";

const API_KEY = "test-api-key";

function request(
  method: string,
  body: unknown,
  authorization = `Bearer ${API_KEY}`,
) {
  return new Request("http://localhost/api/test-site/page", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });
}

describe("test site page API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEST_SITE_API_KEY", API_KEY);
  });

  describe("POST", () => {
    it("creates a page", async () => {
      mockAddTestSitePage.mockResolvedValue({
        path: "/about",
      });

      const response = await POST(
        request("POST", {
          path: "/about",
          title: "About",
          content: "About the site",
        }),
      );

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({
        success: true,
        operation: "created",
        path: "/about",
      });

      expect(mockAddTestSitePage).toHaveBeenCalledWith({
        path: "/about",
        title: "About",
        content: "About the site",
        html: undefined,
        links: undefined,
      });
    });

    it("rejects unauthorized requests", async () => {
      const response = await POST(
        request(
          "POST",
          {
            path: "/about",
            title: "About",
            content: "About",
          },
          "Bearer wrong-key",
        ),
      );

      expect(response.status).toBe(401);
      expect(mockAddTestSitePage).not.toHaveBeenCalled();
    });

    it("rejects an invalid path", async () => {
      const response = await POST(
        request("POST", {
          path: "about",
          title: "About",
          content: "About",
        }),
      );

      expect(response.status).toBe(400);
      expect(mockAddTestSitePage).not.toHaveBeenCalled();
    });

    it("rejects a missing title", async () => {
      const response = await POST(
        request("POST", {
          path: "/about",
          content: "About",
        }),
      );

      expect(response.status).toBe(400);
      expect(mockAddTestSitePage).not.toHaveBeenCalled();
    });

    it("rejects missing content", async () => {
      const response = await POST(
        request("POST", {
          path: "/about",
          title: "About",
        }),
      );

      expect(response.status).toBe(400);
      expect(mockAddTestSitePage).not.toHaveBeenCalled();
    });

    it("returns 409 when the page already exists", async () => {
      mockAddTestSitePage.mockRejectedValue(
        new Error("Unique constraint failed"),
      );

      const response = await POST(
        request("POST", {
          path: "/about",
          title: "About",
          content: "About",
        }),
      );

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        error: "A page already exists at this path",
      });
    });
  });

  describe("PUT", () => {
    it("updates an existing page", async () => {
      mockUpdateTestSitePage.mockResolvedValue({
        count: 1,
      });

      const response = await PUT(
        request("PUT", {
          path: "/about",
          title: "Updated About",
          content: "Updated content",
          html: "<h1>Updated About</h1>",
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        operation: "updated",
        path: "/about",
      });

      expect(mockUpdateTestSitePage).toHaveBeenCalledWith(
        "/about",
        "Updated content",
        "<h1>Updated About</h1>",
        "Updated About",
      );
    });

    it("returns 404 when the page does not exist", async () => {
      mockUpdateTestSitePage.mockResolvedValue({
        count: 0,
      });

      const response = await PUT(
        request("PUT", {
          path: "/missing",
          content: "Updated content",
        }),
      );

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("deletes an existing page", async () => {
      mockDeleteTestSitePage.mockResolvedValue({
        count: 1,
      });

      const response = await DELETE(
        request("DELETE", {
          path: "/about",
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        operation: "deleted",
        path: "/about",
      });

      expect(mockDeleteTestSitePage).toHaveBeenCalledWith("/about");
    });

    it("returns 404 when the page does not exist", async () => {
      mockDeleteTestSitePage.mockResolvedValue({
        count: 0,
      });

      const response = await DELETE(
        request("DELETE", {
          path: "/missing",
        }),
      );

      expect(response.status).toBe(404);
    });

    it("rejects unauthorized deletes", async () => {
      const response = await DELETE(
        request(
          "DELETE",
          {
            path: "/about",
          },
          "Bearer wrong-key",
        ),
      );

      expect(response.status).toBe(401);
      expect(mockDeleteTestSitePage).not.toHaveBeenCalled();
    });
  });
});