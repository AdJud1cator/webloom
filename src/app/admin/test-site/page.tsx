"use client";

import { useEffect, useState } from "react";

type Page = {
  id: string;
  path: string;
  title: string;
  content: string;
  links: string[];
};

export default function TestSiteAdminPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLinks, setNewLinks] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/test-site/pages")
      .then((response) => response.json())
      .then((data) => {
        setPages(data);

        if (data.length > 0) {
          selectPage(data[0]);
        }
      });
  }, []);

  function selectPage(page: Page) {
    setSelectedId(page.id);
    setTitle(page.title);
    setContent(page.content);
    setLinks(page.links ?? []);
    setStatus("");
  }

  async function savePage() {
    setStatus("Saving...");

    const response = await fetch("/api/test-site/pages", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedId,
        title,
        content,
        links,
      }),
    });

    if (!response.ok) {
      setStatus("Failed to save.");
      return;
    }

    const updatedPage = await response.json();

    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === updatedPage.id ? updatedPage : page,
      ),
    );

    setStatus("Saved.");
  }

  async function createPage() {
    setStatus("Creating...");

    const response = await fetch("/api/test-site/pages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: newPath,
        title: newTitle,
        content: newContent,
        links: newLinks,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Failed to create page.");
      return;
    }

    setPages((currentPages) =>
      [...currentPages, data].sort((a, b) =>
        a.path.localeCompare(b.path),
      ),
    );

    selectPage(data);

    setNewPath("");
    setNewTitle("");
    setNewContent("");
    setNewLinks([]);
    setCreating(false);
    setStatus("Page created.");
  }

  async function deletePage() {
    if (!selectedPage) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedPage.path}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setStatus("Deleting...");

    const response = await fetch("/api/test-site/pages", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: selectedPage.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Failed to delete page.");
      return;
    }

    setPages((currentPages) =>
      currentPages.filter((page) => page.id !== selectedPage.id),
    );

    setSelectedId("");
    setTitle("");
    setContent("");
    setLinks([]);
    setStatus(`Deleted ${data.deletedPath}.`);
  }

  function toggleLink(link: string) {
    setLinks((currentLinks) =>
      currentLinks.includes(link)
        ? currentLinks.filter((item) => item !== link)
        : [...currentLinks, link],
    );
  }

  const selectedPage = pages.find((page) => page.id === selectedId);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>WebLoom Test Site Editor</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 1fr",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        <aside>
          <h2>Pages</h2>

          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => selectPage(page)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                marginBottom: "0.25rem",
                textAlign: "left",
                fontWeight:
                  page.id === selectedId ? "bold" : "normal",
              }}
            >
              {page.path}
            </button>
          ))}

          <button
            onClick={() => {
              setCreating(true);
              setStatus("");
              setNewPath("");
              setNewTitle("");
              setNewContent("");
              setNewLinks([]);
            }}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
            }}
          >
            + Create Page
          </button>
        </aside>

        <section>
          {creating && (
            <div style={{ marginBottom: "2rem" }}>
              <h2>Create Page</h2>

              <label>
                Path
                <input
                  value={newPath}
                  onChange={(event) => setNewPath(event.target.value)}
                  placeholder="/new-policy"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.25rem",
                    marginBottom: "1rem",
                  }}
                />
              </label>

              <label>
                Title
                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="New Policy"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.25rem",
                    marginBottom: "1rem",
                  }}
                />
              </label>

              <label>
                Content
                <textarea
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  rows={8}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.25rem",
                    marginBottom: "1rem",
                  }}
                />
              </label>

              <h3>Links</h3>

              {pages.map((page) => (
                <label
                  key={page.id}
                  style={{
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newLinks.includes(page.path)}
                    onChange={() =>
                      setNewLinks((currentLinks) =>
                        currentLinks.includes(page.path)
                          ? currentLinks.filter(
                              (link) => link !== page.path,
                            )
                          : [...currentLinks, page.path],
                      )
                    }
                  />{" "}
                  {page.path}
                </label>
              ))}

              <button onClick={createPage}>
                Create Page
              </button>

              <button
                onClick={() => setCreating(false)}
                style={{ marginLeft: "0.5rem" }}
              >
                Cancel
              </button>
            </div>
          )}
          {!creating && selectedPage ? (
          <>
            <h2>Edit {selectedPage.path}</h2>

            <label>
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.25rem",
                  marginBottom: "1rem",
                }}
              />
            </label>

            <label>
              Content
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={10}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.25rem",
                  marginBottom: "1rem",
                }}
              />
            </label>

            <h3>Links</h3>

            {pages.map((page) => (
              <label
                key={page.id}
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={links.includes(page.path)}
                  onChange={() => toggleLink(page.path)}
                />{" "}
                {page.path}
              </label>
            ))}

            <button
              onClick={savePage}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 1.5rem",
              }}
            >
              Save Changes
            </button>

            <button
              onClick={deletePage}
              style={{
                marginTop: "1.5rem",
                marginLeft: "0.5rem",
                padding: "0.75rem 1.5rem",
                color: "white",
                backgroundColor: "#b91c1c",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Delete Page
            </button>

            {status && (
              <p style={{ marginTop: "1rem" }}>{status}</p>
            )}
          </>
        ) : !creating ? (
          <p>No pages found.</p>
        ) : null}
        </section>
      </div>
    </main>
  );
}