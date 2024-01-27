import sql from "mssql";
const COMMENT_TABLE = "Comments";
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
      console.error(
        `Error connecting to the database: ${JSON.stringify(error)}`
      );
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
  async createBlogArticle(data) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("title", sql.NVarChar(255), data.title);
    request.input("subtitle", sql.NVarChar(255), data.subtitle);
    request.input("author", sql.NVarChar(255), data.author);
    request.input("date_published", sql.DateTime, data.date_published);
    request.input("category", sql.NVarChar(255), data.category);
    request.input("content", sql.Text(), data.content);
    request.input("image_url", sql.NVarChar(255), data.image_url);

    // New inputs for the 'featured' and 'main' columns
    request.input("featured", sql.Bit, data.featured || false);
    request.input("main", sql.Bit, data.main || false);

    const result = await request.query(
      `INSERT INTO BlogArticle (title, subtitle, author, date_published, category, content, image_url, featured, main) VALUES (@title, @subtitle, @author, @date_published, @category, @content, @image_url, @featured, @main); SELECT SCOPE_IDENTITY() AS id;`
    );

    return result.recordset[0].id;
  }

  async updateBlogArticle(id, data) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("id", sql.Int, id);
    request.input("title", sql.NVarChar(255), data.title);
    request.input("subtitle", sql.NVarChar(255), data.subtitle);
    request.input("author", sql.NVarChar(255), data.author);
    request.input("date_published", sql.DateTime, data.date_published);
    request.input("category", sql.NVarChar(255), data.category);
    request.input("content", sql.Text(), data.content);
    request.input("image_url", sql.NVarChar(255), data.image_url);

    // New inputs for the 'featured' and 'main' columns
    request.input("featured", sql.Bit, data.featured || false);
    request.input("main", sql.Bit, data.main || false);

    const result = await request.query(
      `UPDATE BlogArticle SET title = @title, subtitle = @subtitle, author = @author, date_published = @date_published, category = @category, content = @content, image_url = @image_url, featured = @featured, main = @main WHERE id = @id; SELECT @@ROWCOUNT AS rowsAffected;`
    );

    return result.recordset[0].rowsAffected;
  }

  async deleteBlogArticle(id) {
    await this.connect();

    const idAsNumber = Number(id);

    const request = this.poolconnection.request();
    const result = await request
      .input("id", sql.Int, idAsNumber)
      .query(`DELETE FROM BlogArticle WHERE id = @id`);

    return result.rowsAffected[0];
  }
  async read(id) {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request
      .input("id", sql.Int, +id)
      .query(`SELECT * FROM [dbo].[BlogArticle] WHERE id = @id`);
    return result.recordset[0];
  }

  async readTen() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(
      `SELECT top 10 * FROM [dbo].[BlogArticle]`
    );

    return result.recordsets[0];
  }
  async getAllBlogArticles() {
    await this.connect();
    const request = this.poolconnection.request();
    const result = await request.query(`SELECT * FROM BlogArticle`);

    return result.recordsets[0];
  }

  async getBlogArticleById(id) {
    await this.connect();
    const request = this.poolconnection.request();

    request.input("id", sql.Int, id);

    const result = await request.query(
      `SELECT * FROM BlogArticle WHERE id = @id`
    );

    return result.recordset[0];
  }

  // Add similar modifications for other CRUD operations related to BlogArticle

  async createUser(userData) {
    try {
      await this.connect();

      const request = this.poolconnection.request();

      // Assuming 'input_' as a prefix for SQL parameters
      request.input(
        "input_homeAccountId",
        sql.NVarChar(255),
        userData.homeAccountId
      );
      request.input(
        "input_environment",
        sql.NVarChar(255),
        userData.environment
      );
      request.input("input_tenantId", sql.NVarChar(255), userData.tenantId);
      request.input(
        "input_localAccountId",
        sql.NVarChar(255),
        userData.localAccountId
      );
      request.input("input_username", sql.NVarChar(255), userData.username);
      request.input("input_name", sql.NVarChar(255), userData.name);
      request.input(
        "input_authorityType",
        sql.NVarChar(20),
        userData.authorityType
      );

      // Assuming the 'tenantProfiles' and 'idTokenClaims' are empty objects
      request.input(
        "input_tenantProfiles",
        sql.NVarChar(255),
        JSON.stringify(userData.tenantProfiles || {})
      );
      request.input(
        "input_idTokenClaims",
        sql.NVarChar(255),
        JSON.stringify(userData.idTokenClaims || {})
      );

      // Add other input parameters based on your User entity

      const result = await request.query(
        `
        INSERT INTO Users (homeAccountId, environment, tenantId, localAccountId, username, name, authorityType, tenantProfiles, idTokenClaims)
        VALUES (@input_homeAccountId, @input_environment, @input_tenantId, @input_localAccountId, @input_username, @input_name, @input_authorityType, @input_tenantProfiles, @input_idTokenClaims);
  
        SELECT SCOPE_IDENTITY() AS id;
        `
      );

      return result.recordset[0].id;
    } catch (error) {
      // Handle errors appropriately
      console.error("Error creating user:", error.message);
      throw error;
    }
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
  async createComment(userId, content) {
    try {
      await this.connect();
      const request = this.poolconnection.request();

      request.input("userId", sql.Int, userId);
      request.input("content", sql.NVarChar(sql.MAX), content);
      request.input("timestamp", sql.DateTime, new Date());

      const result = await request.query(`
        INSERT INTO ${COMMENT_TABLE} (userId, content, timestamp)
        VALUES (@userId, @content, @timestamp);
        SELECT SCOPE_IDENTITY() AS commentId;
      `);

      return result.recordset[0].commentId;
    } catch (error) {
      console.error("Error creating comment:", error.message);
      throw error;
    }
  }
  async getCommentById(commentId) {
    try {
      await this.connect();
      const request = this.poolconnection.request();

      request.input("commentId", sql.Int, commentId);

      const result = await request.query(`
        SELECT * FROM ${COMMENT_TABLE} WHERE commentId = @commentId
      `);

      return result.recordset[0];
    } catch (error) {
      console.error("Error getting comment:", error.message);
      throw error;
    }
  }

  async updateComment(commentId, content) {
    try {
      await this.connect();
      const request = this.poolconnection.request();

      request.input("commentId", sql.Int, commentId);
      request.input("content", sql.NVarChar(sql.MAX), content);

      const result = await request.query(`
        UPDATE ${COMMENT_TABLE} SET content = @content WHERE commentId = @commentId;
        SELECT @@ROWCOUNT AS rowsAffected;
      `);

      return result.recordset[0].rowsAffected;
    } catch (error) {
      console.error("Error updating comment:", error.message);
      throw error;
    }
  }

  async deleteComment(commentId) {
    try {
      await this.connect();
      const request = this.poolconnection.request();

      request.input("commentId", sql.Int, commentId);

      const result = await request.query(`
        DELETE FROM ${COMMENT_TABLE} WHERE commentId = @commentId;
        SELECT @@ROWCOUNT AS rowsAffected;
      `);

      return result.recordset[0].rowsAffected;
    } catch (error) {
      console.error("Error deleting comment:", error.message);
      throw error;
    }
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
}
