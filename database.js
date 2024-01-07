import sql from "mssql";

export default class Database {
  config = {};
  poolconnection = null;
  connected = false;

  constructor(config) {
    this.config = config;
    console.log(`Database: config: ${JSON.stringify(config)}`);
  }

  async connect() {
    try {
      console.log(`Database connecting...${this.connected}`);
      if (this.connected === false) {
        this.poolconnection = await sql.connect(this.config);
        this.connected = true;
        console.log("Database connection successful");
      } else {
        console.log("Database already connected");
      }
    } catch (error) {
      console.error(`Error connecting to database: ${JSON.stringify(error)}`);
    }
  }

  async disconnect() {
    try {
      this.poolconnection.close();
      console.log("Database connection closed");
    } catch (error) {
      console.error(`Error closing database connection: ${error}`);
    }
  }

  async executeQuery(query) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(query);

    return result.rowsAffected[0];
  }
  async create(data) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("title", sql.NVarChar(255), data.title);
    request.input("subtitle", sql.NVarChar(255), data.subtitle);
    request.input("author", sql.NVarChar(255), data.author);
    request.input("date_published", sql.Date, data.date_published);
    request.input("category", sql.NVarChar(255), data.category);
    request.input("content", sql.Text(), data.content);
    request.input("image_url", sql.NVarChar(255), data.image_url);

    const result = await request.query(
      `INSERT INTO BlogArticle (title, subtitle, author, date_published, category, content, image_url) VALUES (@title, @subtitle, @author, @date_published, @category, @content, @image_url); SELECT SCOPE_IDENTITY() AS id;`
    );

    return result.recordset[0].id;
  }

  async update(id, data) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("id", sql.Int, id);
    request.input("title", sql.NVarChar(255), data.title);
    request.input("subtitle", sql.NVarChar(255), data.subtitle);
    request.input("author", sql.NVarChar(255), data.author);
    request.input("date_published", sql.Date, data.date_published);
    request.input("category", sql.NVarChar(255), data.category);
    request.input("content", sql.Text(), data.content);
    request.input("image_url", sql.NVarChar(255), data.image_url);

    const result = await request.query(
      `UPDATE BlogArticle SET title = @title, subtitle = @subtitle, author = @author, date_published = @date_published, category = @category, content = @content, image_url = @image_url WHERE id = @id; SELECT @@ROWCOUNT AS rowsAffected;`
    );

    return result.recordset[0].rowsAffected;
  }

  // Add similar modifications for other CRUD operations (delete, getById, getAll, etc.)

  async readAll() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT *  FROM [dbo].[BlogArticle] `);
  }
  async readTen() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(
      `SELECT top 10 *  FROM [dbo].[BlogArticle] `
    );

    return result.recordsets[0];
  }
  async createUser(userData) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("username", sql.NVarChar(255), userData.username);
    request.input("email", sql.NVarChar(255), userData.email);
    // Add other input parameters based on your User entity

    const result = await request.query(
      `INSERT INTO Users (username, email) VALUES (@username, @email); SELECT SCOPE_IDENTITY() AS id;`
    );

    return result.recordset[0].id;
  }

  async updateUser(userId, userData) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("id", sql.Int, userId);
    request.input("username", sql.NVarChar(255), userData.username);
    request.input("email", sql.NVarChar(255), userData.email);
    // Add other input parameters based on your User entity

    const result = await request.query(
      `UPDATE Users SET username = @username, email = @email WHERE id = @id; SELECT @@ROWCOUNT AS rowsAffected;`
    );

    return result.recordset[0].rowsAffected;
  }

  async deleteUser(userId) {
    await this.connect();

    const idAsNumber = Number(userId);

    const request = this.poolconnection.request();
    const result = await request
      .input("id", sql.Int, idAsNumber)
      .query(`DELETE FROM Users WHERE id = @id`);

    return result.rowsAffected[0];
  }

  async getAllUsers() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM Users`);

    return result.recordsets[0];
  }

  async getUserById(userId) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("id", sql.Int, userId);

    const result = await request.query(`SELECT * FROM Users WHERE id = @id`);

    return result.recordset[0];
  }
  async read(id) {
    await this.connect();

    const request = this.poolconnection.request();
    const result = await request
      .input("id", sql.Int, +id)
      .query(`SELECT * FROM [dbo].[BlogArticle] WHERE id = @id`);

    return result.recordset[0];
  }

  async update(id, data) {
    await this.connect();

    const request = this.poolconnection.request();

    request.input("id", sql.Int, +id);
    request.input("title", sql.NVarChar(255), data.title);
    request.input("subtitle", sql.NVarChar(255), data.subtitle);
    request.input("author", sql.NVarChar(255), data.author);
    request.input("date_published", sql.Date, data.date_published);
    request.input("category", sql.NVarChar(255), data.category);
    request.input("content", sql.Text(), data.content);
    request.input("category", sql.NVarChar(255), data.category);

    const result = await request.query(
      `UPDATE BlogArticle SET author=@author, title=@title  WHERE id = @id`
    );

    return result.rowsAffected[0];
  }

  async delete(id) {
    await this.connect();

    const idAsNumber = Number(id);

    const request = this.poolconnection.request();
    const result = await request
      .input("id", sql.Int, idAsNumber)
      .query(`DELETE  FROM [dbo].[BlogArticle] WHERE id = @id`);

    return result.rowsAffected[0];
  }
}
