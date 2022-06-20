const { Client } = require("@notionhq/client")

// Initializing a client
const notion = new Client({
  auth: 'secret_VqyM6L6J2EsOjhOKy7p22A8dFVCvOYGKZSlhYuVHPN1',
})


async function getList() {
    try {
        const listUsersResponse = await notion.users.list({})
        console.log(listUsersResponse)
    } catch (error) {
      console.error(error.body)
    }
  }
