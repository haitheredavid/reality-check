const dotenv = require("dotenv");
dotenv.config();

// console.log(process.env)

const { Client } = require("@notionhq/client");

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

getAssignments();
// addItem("Some place in a space!", process.env.NOTION_DATABASE_ID)
