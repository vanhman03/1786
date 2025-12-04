import * as SQLite from "expo-sqlite";

export default class DatabaseHelper {
  constructor() {
    this.initDB();
  }

  async initDB() {
    this.db = await SQLite.openDatabaseAsync("MHikeExpo.db");
    await this.createTables();
  }

  async createTables() {
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS Hikes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        location TEXT,
        date TEXT, 
        parking TEXT, 
        length TEXT, 
        difficulty TEXT, 
        description TEXT
      );
      CREATE TABLE IF NOT EXISTS Observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hike_id INTEGER, 
        observation TEXT, 
        time TEXT, 
        image_path TEXT,
        FOREIGN KEY (hike_id) REFERENCES Hikes(id) ON DELETE CASCADE
      );
    `);
  }

  async addHike(
    name,
    location,
    date,
    parking,
    length,
    difficulty,
    description
  ) {
    if (!this.db) await this.initDB();
    const result = await this.db.runAsync(
      "INSERT INTO Hikes (name, location, date, parking, length, difficulty, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, location, date, parking, length, difficulty, description]
    );
    return result.lastInsertRowId;
  }

  async getHikes() {
    if (!this.db) await this.initDB();
    return await this.db.getAllAsync("SELECT * FROM Hikes ORDER BY id DESC");
  }

  async updateHike(
    id,
    name,
    location,
    date,
    parking,
    length,
    difficulty,
    description
  ) {
    if (!this.db) await this.initDB();
    await this.db.runAsync(
      "UPDATE Hikes SET name = ?, location = ?, date = ?, parking = ?, length = ?, difficulty = ?, description = ? WHERE id = ?",
      [name, location, date, parking, length, difficulty, description, id]
    );
  }

  async deleteHike(id) {
    if (!this.db) await this.initDB();
    await this.db.runAsync("DELETE FROM Observations WHERE hike_id = ?", [id]);
    await this.db.runAsync("DELETE FROM Hikes WHERE id = ?", [id]);
  }

  // --- OBSERVATIONS ---
  async addObservation(hikeId, observation, time, imagePath) {
    if (!this.db) await this.initDB();
    await this.db.runAsync(
      "INSERT INTO Observations (hike_id, observation, time, image_path) VALUES (?, ?, ?, ?)",
      [hikeId, observation, time, imagePath]
    );
  }

  async getObservations(hikeId) {
    if (!this.db) await this.initDB();
    return await this.db.getAllAsync(
      "SELECT * FROM Observations WHERE hike_id = ? ORDER BY id DESC",
      [hikeId]
    );
  }

  async deleteImageObservations(hikeId) {
    if (!this.db) await this.initDB();
    await this.db.runAsync(
      "DELETE FROM Observations WHERE hike_id = ? AND image_path IS NOT NULL",
      [hikeId]
    );
  }
}
