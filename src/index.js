const dotenv = require("dotenv");
dotenv.config();

const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const { log } = require("console");

console.log("trying to get client");
const notion = new Client({ auth: process.env.NOTION_KEY });

async function getItems() {
  const pages = [];
  let cursor = undefined;

  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      start_cursor: cursor,
    });
    pages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  console.log(`${pages.length} pages successfully fetched.`);
  return pages.map((page) => {
    const statusProperty = page.properties["Status"];
    const status = statusProperty ? statusProperty.select.name : "No Status";
    const title = page.properties["Name"].title
      .map(({ plain_text }) => plain_text)
      .join("");
    return {
      pageId: page.id,
      status,
      title,
    };
  });
}

async function getAssignments() {
  const pages = [];
  let cursor = undefined;

  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      start_cursor: cursor,
      filter: {
        or: [
          {
            property: "Type",
            select: {
              equals: "Assignment",
            },
          },
        ],
      },
    });
    console.log(results);
    pages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  console.log(`${pages.length} pages successfully fetched.`);
  return pages.map((page) => {
    const title = page.properties["Name"].title
      .map(({ plain_text }) => plain_text)
      .join("");
    return {
      pageId: page.id,
      title,
    };
  });
}

async function addItem(text, databaseId) {
  console.log(databaseId);
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      title: {
        title: [
          {
            text: {
              content: text,
            },
          },
        ],
      },
    },
  });
  console.log(response);
  console.log("Success! Entry added.");
}

async function getPage(pageId) {
  console.log("Getting Page");
  console.log(pageId);
  const page = await notion.pages.retrieve({ page_id: pageId });
  console.log("page received")
  console.log(page);
}
async function getMarkDown(pageId) {
  console.log("Getting Page as Markdown");

  const n2m = new NotionToMarkdown({ notionClient: notion });
  const mdblocks = await n2m.pageToMarkdown(pageId);
  console.log("markdown received")
  console.log(mdblocks);
  const mdString = n2m.toMarkdownString(mdblocks);
  console.log(mdString);

  fs.writeFile("test.md", mdString, (err) => {
    console.log(err);
  });

  // console.log(pageId)
  // const response = await notion.pages.retrieve({ page_id: pageId })
  // console.log(response)
}
getPage("557f12b3953e467894092082f66f7410");

// getMarkDown("557f12b3953e467894092082f66f7410");
// getAssignments();
// addItem("Some place in a space!", process.env.NOTION_DATABASE_ID)
