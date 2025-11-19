// 1. Mostrar tots els documents en la col·lecció Restaurants.
db.restaurants.find({}, { _id: 0 });

// 2. Mostrar el restaurant_id i name per tots els documents en la col·lecció Restaurants.
db.restaurants.find({}, { restaurant_id: 1, name: 1, _id: 0 });

// 3. Mostrar el restaurant_id, name, borough i cuisine.
db.restaurants.find({}, { restaurant_id: 1, name: 1, borough: 1, cuisine: 1, _id: 0 });

// 4. Mostrar restaurant_id, name, borough i zip code.
db.restaurants.find({}, { _id: 0, restaurant_id: 1, name: 1, borough: 1, "address.zipcode": 1 });

// 5. Mostrar tots els restaurants que estan en el Bronx.
db.restaurants.find({ borough: "Bronx" }, { _id: 0 });

// 6. Mostrar els primers 5 restaurants que estan en el Bronx.
db.restaurants.find({ borough: "Bronx" }, { _id: 0 }).limit(5);

// 7. Mostrar el pròxims 5 restaurants després de saltar els primers 5 del Bronx.
db.restaurants.find({ borough: "Bronx" }, { _id: 0 }).skip(5).limit(5);

// 8. Trobar els restaurants amb un score de més de 90.
db.restaurants.find({ "grades.score": { $gt: 90 } }, { _id: 0 });

// 9. Trobar els restaurants amb un score de més de 80 però menys que 100.
db.restaurants.find({ "grades.score": { $gt: 80, $lt: 100 } }, { _id: 0 });

// 10. Trobar els restaurants amb longitud menor que -95.754168.
db.restaurants.find({ "location.coordinates.0": { $lt: -95.754168 } }, { _id: 0 });

// 11. Trobar restaurants que no preparen 'American', amb qualificació > 70 i longitud < -65.754168.
db.restaurants.find({ $and: [{ cuisine: { $ne: "American" } }, { "grades.score": { $gt: 70 } }, { "location.coordinates.0": { $lt: -65.754168 } } ] }, { _id: 0 });

// 12. El mateix que l'anterior però sense usar operador $and.
db.restaurants.find({ cuisine: { $ne: "American" }, "grades.score": { $gt: 70 }, "location.coordinates.0": { $lt: -65.754168 } }, { _id: 0 });

// 13. Trobar restaurants que no són 'American', grau 'A', i no són de Brooklyn. Ordenats per cuisine descendent.


// 14. Trobar restaurant_id, name, borough i cuisine on el nom comença amb 'Wil'.
db.restaurants.find({ name: /^Wil/ }, { _id: 0, restaurant_id: 1, name: 1, borough: 1, cuisine: 1 });

// 15. Trobar restaurant_id, name, borough i cuisine on el nom acaba en 'ces'.
db.restaurants.find({ name: /ces$/ }, { _id: 0, restaurant_id: 1, name: 1, borough: 1, cuisine: 1 });

// 16. Trobar restaurant_id, name, borough i cuisine on el nom conté 'Reg'.
db.restaurants.find({ name: /Reg/ }, { _id: 0, restaurant_id: 1, name: 1, borough: 1, cuisine: 1 });

// 17. Trobar restaurants del Bronx que preparen cuina americana o xinesa.
db.restaurants.find({ borough: "Bronx", $or: [ { cuisine: "American" }, { cuisine: "Chinese" } ] }, { _id: 0 });

// 18. Trobar restaurant_id, name, borough i cuisine per a Staten Island, Queens, Bronx o Brooklyn.
db.restaurants.find({ borough: { $in: ["Staten Island", "Queens", "Bronx", "Brooklyn"] } }, { restaurant_id: 1, name: 1, borough: 1, cuisine: 1, _id: 0 });

// 19. Trobar restaurant_id, name, borough i cuisine per a restaurants que NO són d'aquests barris.
db.restaurants.find({ borough: { $nin: ["Staten Island", "Queens", "Bronx", "Brooklyn"] } }, { _id: 0, restaurant_id: 1, name: 1, borough: 1, cuisine: 1 });

// 20. Trobar restaurant_id, name, borough i cuisine amb marcador no superior a 10.
db.restaurants.find({ "grades.score": { $not: { $gt: 10 }}}, { restaurant_id: 1, name: 1, borough: 1, cuisine: 1, _id: 0 });

// 21. Trobar restaurants que preparen peix, no 'American' ni 'Chinees', o nom comença amb 'Wil'.
db.restaurants.find({ $or: [{ cuisine: "Seafood" }, { cuisine: { $nin: ["American", "Chinese"]}}, { name: /^Wil/ }]}, { _id: 0 });

// 22. Trobar restaurant_id, name, i grades per grau "A", score 11, i data "2014-08-11T00:00:00Z".
db.restaurants.find({ grades: { $elemMatch: { grade: "A", score: 11, date: ISODate("2014-08-11T00:00:00Z") } } }, { restaurant_id: 1, name: 1, grades: 1, _id: 0 });

// 23. Trobar restaurant_id, name i grades on el 2n element té grau "A", score 9 i data "2014-08-11T00:00:00Z".
db.restaurants.find({ "grades.1.grade": "A", "grades.1.score": 9, "grades.1.date": ISODate("2014-08-11T00:00:00Z")}, { restaurant_id: 1, name: 1, grades: 1, _id: 0 });

// 24. Trobar el restaurant_id, name, street, zipcode i coordenades dels restaurants a menys de 5 km de [-74, 40.7].


// 25. Ordenar els noms dels restaurants en ordre ascendent, mostrant totes les columnes.
db.restaurants.find({}, { _id: 0 }).sort({ name: 1 });

// 26. Ordenar els noms dels restaurants en ordre descendent, mostrant totes les columnes.
db.restaurants.find({}, { _id: 0 }).sort({ name: -1 });

// 27. Ordenar cuisine ascendent i borough descendent.
db.restaurants.find({}, { _id: 0 }).sort({ cuisine: 1, borough: -1 });

// 28. Mostrar direccions que no contenen el carrer.
db.restaurants.find({ "address.street": "" }, { address: 1, _id: 0 });

// 29. Seleccionar documents on el valor de `coordinate` és de tipus Double. Mostrar el name, restaurant_id i coordinades.
db.restaurants.find({ "location.coordinates.0": { $type: "double" } }, { _id: 0, name: 1, restaurant_id: 1, "location.coordinates": 1 });

// 30. Mostrar restaurant_id, name i grade per restaurants amb marcador divisible per 7 (resta 0).

// 31. Trobar name, borough, longitud, latitud i cuisine per noms que contenen 'mon'.
db.restaurants.find({ name: /mon/i }, { _id: 0, name: 1, borough: 1, "location.coordinates": 1, cuisine: 1 });

// 32. Mostrar restaurant_id, name i grade i score de més de 80 però menys que 100.
db.restaurants.find({ "grades.score": { $gt: 80, $lt: 100 } }, { _id: 0, restaurant_id: 1, name: 1, "grades.grade": 1, "grades.score": 1 });
