Se dă o aplicație Express `app` care gestionează restaurante, adrese și elemente de meniu.

Entități:

- `Restaurant` (părinte)
  - `id` (generat automat, număr întreg)
  - `name` (string, nenegol)
  - `rating` (număr întreg între 1 și 5)

- `Address` (1–1 cu `Restaurant`)
  - `street` (string, nenegol)
  - `city` (string, nenegol)

- `MenuItem` (1–N cu `Restaurant`)
  - `name` (string, nenegol)
  - `price` (număr pozitiv)

Datele pot fi stocate in-memory (de ex. array-uri) – nu este necesară o bază de date.

Endpoint-urile relevante:

- `POST /restaurants`
- `PUT /restaurants/:restaurantId`
- `DELETE /restaurants/:restaurantId`
- `GET /restaurants`
- `POST /restaurants/:restaurantId/address`
- `POST /restaurants/:restaurantId/menu-items`

Corpurile request-urilor trebuie să fie JSON valide.

Formatul răspunsurilor de eroare va fi un obiect JSON cu o proprietate `message`, după cum este specificat mai jos.

---

### 1. `POST /restaurants`

Request body așteptat:

```json
{
  "name": "La Bunica",
  "rating": 4
}
```

Condiții:

- `name`: obligatoriu, string nenegol
- `rating`: obligatoriu, număr întreg între 1 și 5 (inclusiv)

Cazuri de test pentru restaurante (4 cazuri):

1. R1 – Missing body
   - Dacă request-ul nu are body (undefined) sau body-ul este gol logic (ex. nu a fost trimis JSON deloc), se va returna:
     - status `400`
     - body: `{"message": "body is missing"}`

2. R2 – Malformed body (missing properties)
   - Dacă lipsește `name` sau lipsește `rating` din corp, se va returna:
     - status `400`
     - body: `{"message": "malformed request"}`

3. R3 – Invalid rating (not between 1 and 5)
   - Dacă `rating` nu este număr sau nu este cuprins în [1, 5], se va returna:
     - status `400`
     - body: `{"message": "rating should be between 1 and 5"}`

4. R4 – Valid restaurant creation
   - Dacă `name` este un string nenegol și `rating` este întreg între 1 și 5:
     - restaurantul este adăugat în colecția internă
     - status `201`
     - body: `{"message": "created"}`

---

### 2. `POST /restaurants/:restaurantId/address`

Request body așteptat:

```json
{
  "street": "Str. Principala 1",
  "city": "Cluj"
}
```

Condiții:

- `street`: obligatoriu, string nenegol
- `city`: obligatoriu, string nenegol
- relație 1–1: fiecare restaurant poate avea cel mult o adresă (dacă există deja, poate fi suprascrisă sau tratată ca eroare – pentru această temă se permite suprascrierea fără eroare suplimentară).

Cazuri de test pentru adresă (4 cazuri):

5. A1 – Missing body
   - Dacă request-ul nu are body:
     - status `400`
     - body: `{"message": "body is missing"}`

6. A2 – Malformed body (missing properties)
   - Dacă lipsește `street` sau lipsește `city`:
     - status `400`
     - body: `{"message": "malformed request"}`

7. A3 – Empty street
   - Dacă `street` este string gol (`""`) sau doar spații:
     - status `400`
     - body: `{"message": "street should not be empty"}`

8. A4 – Valid address creation
   - Dacă `street` și `city` sunt stringuri nenegale:
     - adresa este asociată restaurantului cu `restaurantId`
     - status `201`
     - body: `{"message": "created"}`

(Dacă `restaurantId` nu există, este recomandat să se întoarcă `404 {"message": "restaurant not found"}`, chiar dacă nu este acoperit explicit de un test.)

---

### 3. `POST /restaurants/:restaurantId/menu-items`

Request body așteptat:

```json
{
  "name": "Supa de legume",
  "price": 25.5
}
```

Condiții:

- `name`: obligatoriu, string nenegol
- `price`: obligatoriu, număr pozitiv (> 0)

Cazuri de test pentru `menu-items` (4 cazuri):

9. M1 – Missing body
   - Dacă request-ul nu are body:
     - status `400`
     - body: `{"message": "body is missing"}`

10. M2 – Malformed body (missing properties)
    - Dacă lipsește `name` sau lipsește `price`:
      - status `400`
      - body: `{"message": "malformed request"}`

11. M3 – Negative price
    - Dacă `price` nu este număr sau este ≤ 0:
      - status `400`
      - body: `{"message": "price should be a positive number"}`

12. M4 – Valid menu-item creation
    - Dacă `name` este string nenegol și `price` este număr pozitiv:
      - elementul de meniu este adăugat la restaurantul cu `restaurantId`
      - status `201`
      - body: `{"message": "created"}`

(Dacă `restaurantId` nu există, este recomandat `404 {"message": "restaurant not found"}`.)

---

### 4. `GET /restaurants`

Răspunsul va fi o listă de restaurante cu adrese și elemente de meniu încărcate.

Exemplu de răspuns:

```json
[
  {
    "id": 1,
    "name": "La Bunica",
    "rating": 4,
    "address": {
      "street": "Str. Principala 1",
      "city": "Cluj"
    },
    "menuItems": [
      {
        "id": 1,
        "name": "Supa de legume",
        "price": 25.5
      }
    ]
  }
]
```

Se suportă sortarea descrescătoare după rating folosind query params:

- `GET /restaurants?sort=rating&direction=desc`

Cazuri de test pentru `GET /restaurants` (3 cazuri):

13. G1 – Loaded restaurants contain addresses
    - După ce a fost creat un restaurant și adresa lui, un request `GET /restaurants` trebuie să includă proprietatea `address` pentru restaurantul respectiv (nu `null`).

14. G2 – Loaded restaurants contain menu-items
    - După ce au fost create unul sau mai multe `menu-items` pentru un restaurant, `GET /restaurants` trebuie să includă proprietatea `menuItems` ca array cu elementele create.

15. G3 – Restaurants can be sorted descending by rating
    - Dacă există mai multe restaurante cu rating diferit și se apelează:
      - `GET /restaurants?sort=rating&direction=desc`

    - lista returnată trebuie să fie ordonată descrescător după `rating`.

---

### 5. `PUT /restaurants/:restaurantId`

Request body așteptat (similar cu `POST /restaurants`):

```json
{
  "name": "La Bunica Renovata",
  "rating": 5
}
```

Cazuri de test pentru update restaurant (3 cazuri):

16. U1 – Updating with malformed body
    - Dacă lipsește `name` sau `rating` din body:
      - status `400`
      - body: `{"message": "malformed request"}`

17. U2 – Updating with invalid rating
    - Dacă `rating` nu este în [1, 5]:
      - status `400`
      - body: `{"message": "rating should be between 1 and 5"}`

18. U3 – Valid restaurant update
    - Dacă body-ul este valid:
      - restaurantul cu `restaurantId` este actualizat
      - status `200`
      - body: `{"message": "updated"}`

    - Dacă restaurantul nu există:
      - recomandat: `404 {"message": "restaurant not found"}` (testele pot decide dacă verifică sau nu acest caz).

---

### 6. `DELETE /restaurants/:restaurantId`

Șterge restaurantul și datele asociate (adresă, `menuItems`) astfel încât restaurantul să nu mai apară în `GET /restaurants`.

Cazuri de test pentru delete restaurant (2 cazuri):

19. D1 – Deleting non-existing restaurant
    - Dacă nu există restaurant cu `restaurantId`:
      - status `404`
      - body: `{"message": "restaurant not found"}`

20. D2 – Valid restaurant deletion
    - Dacă restaurantul există:
      - acesta este șters (împreună cu adresa și `menuItems` asociate)
      - status `200`
      - body: `{"message": "deleted"}`
