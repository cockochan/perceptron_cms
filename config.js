import * as dotenv from "dotenv";
// dotenv.config({ path: `.env.${process.env.NODE_ENV}`, debug: true });
import "dotenv/config";
const server = process.env.AZURE_SQL_SERVER;
const database = process.env.AZURE_SQL_DATABASE;
const port = parseInt(process.env.AZURE_SQL_PORT);
const type = process.env.AZURE_SQL_AUTHENTICATIONTYPE;

const user = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;

export const config = {
  user, // better stored in an app setting such as process.env.DB_USER
  password, // better stored in an app setting such as process.env.DB_PASSWORD
  server, // better stored in an app setting such as process.env.DB_SERVER
  port, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
  database, // better stored in an app setting such as process.env.DB_NAME
  authentication: {
    type: "default",
  },
  options: {
    encrypt: true,
  },
};
