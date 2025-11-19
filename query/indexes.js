use("restaurants_db");

db.restaurants.createIndex({ borough: 1 });
db.restaurants.createIndex({ cuisine: 1 });
db.restaurants.createIndex({ name: 1 });
db.restaurants.createIndex({ "grades.score": 1 });
