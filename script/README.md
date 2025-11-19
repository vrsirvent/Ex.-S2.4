# **📚 Instruccions per  l'ús del MongoDB Query Evaluator**

## **💻 1. Clonar el teu Repositori Localment**
Executa al teu terminal:

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git

cd mongodb-queries-elTeuNom
```

## **📤 2. Pujer Canvis a GitHub**
1. **Escriu les teves consultes** a `query/queries.js` **i els índexs** a `query/indexes.js`
2. **Desa els teus canvis**:

```bash
git add query/queries.js query/indexes.js

git commit -m "test: Update queries and indexes"
```
----
2. **Fes push al teu repositori**:

```bash
git push origin main
```
----
## **🧪 Vols executar provas abans de pujar canvis al repositori?** 

### ⚙️ Requisits Previs

💻 **Software Necessari**
- 🐳 **Docker Desktop** ([Descarregar](https://www.docker.com/products/docker-desktop))
- 🟩 **Node.js** v18 o superior ([Descarregar](https://nodejs.org/))
---

📦 **Instal-lació de Dependències** 

Executa a l'arrel del projecte:
```bash
npm install
```
----
### 🛠️ Passos per executar les provas:

1. 📝 **Escriu les teves consultes a query/queries.js i els índexs a query/indexes.js**
---

2. 🧹 **Dóna format a les teves consultes per poder-les executar amnb mongosh des del contenidor:**

```bash
node script/formatQueries.js
```
Aquet script crearà el fitxer `query/execute.js`

---

4. 🚀 **Inicia el contenidor Docker:**

```bash
docker-compose up -d
```
---

5. 🔍 **Assegura't que el contenidor està diponible:**

```bash
docker ps
```
---

6. 👨🏻‍💻 **Executa les consultes i desa el resultat a un fitxer json:**

```bash
docker exec -i mongo-evaluator mongosh --quiet "mongodb://user:pass@localhost:27017/nyc?authSource=admin" query/execute.js > result/myResult.json
```
---

7. 📊 **Executa l'anàlisi dels resultats i genera l'informe:**

```bash
node script/compareResults.js
```
Els resultats es mostraran per consola i es desaran a `docs/resultReport.md`

---

8. ⚡ **Executa l'anàlisi de rendiment**

```bash
node script/performaceReporter.js
```
---

9. 📁 **El resultat es mostraraà per consola i es desarà un informe a `docs/performanceReport.md`**
