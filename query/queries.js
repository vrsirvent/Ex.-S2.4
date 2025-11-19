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


// 17. Trobar restaurants del Bronx que preparen cuina americana o xinesa.


// 18. Trobar restaurant_id, name, borough i cuisine per a Staten Island, Queens, Bronx o Brooklyn.


// 19. Trobar restaurant_id, name, borough i cuisine per a restaurants que NO són d'aquests barris.


// 20. Trobar restaurant_id, name, borough i cuisine amb marcador no superior a 10.


// 21. Trobar restaurants que preparen peix, no 'American' ni 'Chinees', o nom comença amb 'Wil'.


// 22. Trobar restaurant_id, name, i grades per grau "A", score 11, i data "2014-08-11T00:00:00Z".


// 23. Trobar restaurant_id, name i grades on el 2n element té grau "A", score 9 i data "2014-08-11T00:00:00Z".


// 24. Trobar el restaurant_id, name, street, zipcode i coordenades dels restaurants a menys de 5 km de [-74, 40.7].


// 25. Ordenar els noms dels restaurants en ordre ascendent, mostrant totes les columnes.


// 26. Ordenar els noms dels restaurants en ordre descendent, mostrant totes les columnes.


// 27. Ordenar cuisine ascendent i borough descendent.


// 28. Mostrar direccions que no contenen el carrer.


// 29. Seleccionar documents on el valor de `coordinate` és de tipus Double. Mostrar el name, restaurant_id i coordinades.


// 30. Mostrar restaurant_id, name i grade per restaurants amb marcador divisible per 7 (resta 0).


// 31. Trobar name, borough, longitud, latitud i cuisine per noms que contenen 'mon'.


// 32. Mostrar restaurant_id, name i grade i score de més de 80 però menys que 100.
