import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpsertTestSitePage } = vi.hoisted(() => ({
  mockUpsertTestSitePage: vi.fn(),
}));

vi.mock("@/lib/test-site/mutations", () => ({
  upsertTestSitePage: mockUpsertTestSitePage,
}));

import { POST } from "./route";

describe("POST /api/test-site/snapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TEST_SITE_API_KEY", "test-secret");
  });

  it("rejects requests without authentication", async () => {
    const request = new Request(
      "http://localhost/api/test-site/snapshot",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com/",
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(mockUpsertTestSitePage).not.toHaveBeenCalled();
  });

  it("rejects an invalid URL", async () => {
    const request = new Request(
      "http://localhost/api/test-site/snapshot",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "not-a-url",
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockUpsertTestSitePage).not.toHaveBeenCalled();
  });

  it("rejects localhost URLs", async () => {
    const request = new Request(
      "http://localhost/api/test-site/snapshot",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "http://localhost:3000/",
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mockUpsertTestSitePage).not.toHaveBeenCalled();
  });

  it("snapshots a public page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          "<!doctype html><html><head><title>Example Domain</title></head><body><h1>Hello</h1></body></html>",
          {
            status: 200,
            headers: {
              "Content-Type": "text/html",
            },
          },
        ),
      ),
    );

    mockUpsertTestSitePage.mockResolvedValue({
      path: "/snapshots/example-com",
    });

    const request = new Request(
      "http://localhost/api/test-site/snapshot",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com/",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);

    expect(body).toEqual({
      success: true,
      operation: "snapshotted",
      path: "/snapshots/example-com",
      sourceUrl: "https://example.com/",
    });

    expect(mockUpsertTestSitePage).toHaveBeenCalledWith({
      path: "/snapshots/example-com",
      title: "Example Domain",
      content:
        "<!doctype html><html><head><title>Example Domain</title></head><body><h1>Hello</h1></body></html>",
      html:
        "<!doctype html><html><head><title>Example Domain</title></head><body><h1>Hello</h1></body></html>",
      sourceUrl: "https://example.com/",
    });
  });

  it("updates an existing snapshot when the same URL is snapshotted again", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          "<html><head><title>Example Domain Modified</title></head><body><h1>Modified</h1></body></html>",
          {
            status: 200,
            headers: {
              "Content-Type": "text/html",
            },
          },
        ),
      ),
    );

    mockUpsertTestSitePage.mockResolvedValue({
      path: "/snapshots/example-com",
    });

    const request = new Request(
      "http://localhost/api/test-site/snapshot",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com/",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.operation).toBe("snapshotted");

    expect(mockUpsertTestSitePage).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/snapshots/example-com",
        title: "Example Domain Modified",
        sourceUrl: "https://example.com/",
      }),
    );
  });

  it("returns 502 when the source cannot be fetched", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure")),
    );

    const request = new Request(
      "http://localhost/api/test-site/snapshot",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com/",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(502);

    expect(body).toEqual({
      error: "Failed to fetch URL",
    });

    expect(mockUpsertTestSitePage).not.toHaveBeenCalled();
  });

  it("returns 502 when the source returns an HTTP error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Not found", {
          status: 404,
        }),
      ),
    );

    const request = new Request(
      "http://localhost/api/test-site/snapshot",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com/missing",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(502);

    expect(body).toEqual({
      error: "Source returned HTTP 404",
    });

    expect(mockUpsertTestSitePage).not.toHaveBeenCalled();
  });
});