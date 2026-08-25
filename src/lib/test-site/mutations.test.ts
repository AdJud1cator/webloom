import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCreate,
  mockUpdateMany,
  mockDeleteMany,
  mockFindUnique,
} = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    site: {
      findUnique: mockFindUnique,
    },
    page: {
      create: mockCreate,
      updateMany: mockUpdateMany,
      deleteMany: mockDeleteMany,
    },
  },
}));

import {
  addTestSitePage,
  deleteTestSitePage,
  updateTestSitePage,
} from "./mutations";

describe("test site page mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a page for the test site", async () => {
    mockFindUnique.mockResolvedValue({
      id: "site-123",
      slug: "test-site",
    });

    mockCreate.mockResolvedValue({
      id: "page-123",
      path: "/about",
      title: "About",
      content: "About the site",
    });

    const result = await addTestSitePage({
      path: "/about",
      title: "About",
      content: "About the site",
      html: "<p>About the site</p>",
      links: ["/news"],
    });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        slug: "test-site",
      },
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        siteId: "site-123",
        path: "/about",
        title: "About",
        content: "About the site",
        html: "<p>About the site</p>",
        links: ["/news"],
      },
    });

    expect(result.path).toBe("/about");
  });

  it("throws when the test site does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(
      addTestSitePage({
        path: "/about",
        title: "About",
        content: "About the site",
      }),
    ).rejects.toThrow("Test site not found");

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("updates an existing test site page", async () => {
    mockUpdateMany.mockResolvedValue({
      count: 1,
    });

    const result = await updateTestSitePage(
      "/about",
      "Updated content",
      "<p>Updated content</p>",
    );

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: {
        site: {
          slug: "test-site",
        },
        path: "/about",
      },
      data: {
        content: "Updated content",
        html: "<p>Updated content</p>",
      },
    });

    expect(result.count).toBe(1);
  });

  it("deletes an existing test site page", async () => {
    mockDeleteMany.mockResolvedValue({
      count: 1,
    });

    const result = await deleteTestSitePage("/about");

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        site: {
          slug: "test-site",
        },
        path: "/about",
      },
    });

    expect(result.count).toBe(1);
  });

  it("returns zero when deleting a page that does not exist", async () => {
    mockDeleteMany.mockResolvedValue({
      count: 0,
    });

    const result = await deleteTestSitePage("/missing");

    expect(result.count).toBe(0);
  });
});