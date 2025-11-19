#!/bin/bash
set -e

echo "Checking if 'restaurants' collection exists in the 'nyc' database..."

COLLECTION_EXISTS=$(mongosh "mongodb://user:pass@localhost:27017/nyc?authSource=admin" --quiet --eval "db.getCollectionNames().indexOf('restaurants') >= 0")
COLLECTION_EMPTY=$(mongosh "mongodb://user:pass@localhost:27017/nyc?authSource=admin" --quiet --eval "db.restaurants.countDocuments() <= 0")

if [ "$COLLECTION_EXISTS" = "true" ] && [ "$COLLECTION_EMPTY" = "false" ]; then
  echo "🍽️ 'restaurants' collection already exists, skipping import."
else
  echo "🚀 Importing 'restaurants' collection data from JSON file..."
  mongoimport --db nyc --collection restaurants --jsonArray --file /mongo-seed/restaurants.json
  echo "✅ Import completed."
fi
