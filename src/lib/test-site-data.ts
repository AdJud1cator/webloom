export type TestSitePage = {
  path: string;
  title: string;
  content: string;
  links: string[];
};

export const testSitePages: TestSitePage[] = [
  {
    path: "/",
    title: "Welcome",
    content:
      "Welcome to the WebLoom test site. This site is designed to provide realistic pages and links for testing web crawlers.",
    links: [
      "/about",
      "/services",
      "/resources",
      "/news",
      "/contact",
    ],
  },
  {
    path: "/about",
    title: "About Us",
    content:
      "This organisation provides information, services, and resources to support its community. This page contains general information about the organisation and its purpose.",
    links: ["/", "/services", "/contact"],
  },
  {
    path: "/services",
    title: "Services",
    content:
      "We provide a range of services designed to help organisations understand their obligations and access useful resources.",
    links: ["/", "/services/service-a", "/services/service-b"],
  },
  {
    path: "/services/service-a",
    title: "Service A",
    content:
      "Service A provides assistance with information management and compliance requirements. Further information is available in our resources section.",
    links: ["/services", "/resources/guide"],
  },
  {
    path: "/services/service-b",
    title: "Service B",
    content:
      "Service B provides guidance and support for organisations that need to understand applicable requirements and processes.",
    links: ["/services", "/resources/requirements"],
  },
  {
    path: "/resources",
    title: "Resources",
    content:
      "This section contains guides, reference material, and other resources that may assist organisations in understanding relevant requirements.",
    links: ["/", "/resources/guide", "/resources/requirements"],
  },
  {
    path: "/resources/guide",
    title: "Information Guide",
    content:
      "This guide provides general information about the processes and requirements that organisations should consider when maintaining their records and procedures.",
    links: ["/resources", "/resources/requirements"],
  },
  {
    path: "/resources/requirements",
    title: "Requirements",
    content:
      "Organisations should maintain accurate records, review their procedures regularly, and ensure that relevant information remains current.",
    links: ["/resources", "/services/service-a", "/contact"],
  },
  {
    path: "/news",
    title: "News",
    content:
      "This page contains announcements and updates. Changes to this page can be used to test whether a crawler correctly identifies content changes.",
    links: ["/", "/about", "/contact"],
  },
  {
    path: "/contact",
    title: "Contact",
    content:
      "For further information, please contact the organisation using the details provided on this page.",
    links: ["/", "/about"],
  },
];