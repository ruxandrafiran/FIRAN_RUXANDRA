You are given an Express application `app` that manages restaurants, addresses, and menu items.

### **Entities**

**Restaurant** (parent entity)

- `id` (auto-generated integer)
- `name` (non-empty string)
- `rating` (integer between 1 and 5)

**Address** (1–1 relation with `Restaurant`)

- `street` (non-empty string)
- `city` (non-empty string)

**MenuItem** (1–N relation with `Restaurant`)

- `name` (non-empty string)
- `price` (positive number)

Data may be stored in memory (e.g., arrays); a real database is not required for the assignment.

### **Relevant Endpoints**

- `POST /restaurants`
- `PUT /restaurants/:restaurantId`
- `DELETE /restaurants/:restaurantId`
- `GET /restaurants`
- `POST /restaurants/:restaurantId/address`
- `POST /restaurants/:restaurantId/menu-items`

Request bodies must be valid JSON.

All error responses must return a JSON object containing a `message` property matching the strings specified below.

---

## **1. `POST /restaurants`**

**Expected request body:**

```json
{
  "name": "La Bunica",
  "rating": 4
}
```

**Validation rules:**

- `name`: required, non-empty string
- `rating`: required, integer between 1 and 5 (inclusive)

### **Test cases (4 tests)**

1. **R1 – Missing body**

   If the request has no body (undefined) or logically empty (e.g., no JSON sent), return:
   - status `400`
   - body: `{"message": "body is missing"}`

2. **R2 – Malformed body (missing properties)**
   If `name` or `rating` is missing:
   - status `400`
   - body: `{"message": "malformed request"}`

3. **R3 – Invalid rating (not between 1 and 5)**
   If `rating` is not a number or not within `[1, 5]`:
   - status `400`
   - body: `{"message": "rating should be between 1 and 5"}`

4. **R4 – Valid restaurant creation**

   If data is valid:
   - the restaurant is added to the internal collection
   - status `201`
   - body: `{"message": "created"}`

---

## **2. `POST /restaurants/:restaurantId/address`**

**Expected request body:**

```json
{
  "street": "Str. Principala 1",
  "city": "Cluj"
}
```

**Validation rules:**

- `street`: required, non-empty string
- `city`: required, non-empty string
- Relation is 1–1: each restaurant may have at most one address.
  Overwriting an existing address is allowed for this assignment.

### **Test cases (4 tests)**

5. **A1 – Missing body**
   - status `400`
   - body: `{"message": "body is missing"}`

6. **A2 – Malformed body (missing properties)**
   If `street` or `city` is missing:
   - status `400`
   - body: `{"message": "malformed request"}`

7. **A3 – Empty street**
   If `street` is an empty string or contains only spaces:
   - status `400`
   - body: `{"message": "street should not be empty"}`

8. **A4 – Valid address creation**
   - address is attached to the restaurant
   - status `201`
   - body: `{"message": "created"}`

If the restaurant does not exist, returning:

```json
{ "message": "restaurant not found" }
```

with status `404` is recommended but not explicitly tested.

---

## **3. `POST /restaurants/:restaurantId/menu-items`**

**Expected request body:**

```json
{
  "name": "Supa de legume",
  "price": 25.5
}
```

**Validation rules:**

- `name`: required, non-empty string
- `price`: required, positive number (> 0)

### **Test cases (4 tests)**

9. **M1 – Missing body**
   - status `400`
   - body: `{"message": "body is missing"}`

10. **M2 – Malformed body (missing properties)**
    If `name` or `price` is missing:
    - status `400`
    - body: `{"message": "malformed request"}`

11. **M3 – Negative price**

    If `price` is not a number or ≤ 0:
    - status `400`
    - body: `{"message": "price should be a positive number"}`

12. **M4 – Valid menu-item creation**
    - the menu item is added to the restaurant
    - status `201`
    - body: `{"message": "created"}`

If the restaurant does not exist, returning:

```json
{ "message": "restaurant not found" }
```

with status `404` is recommended.

---

## **4. `GET /restaurants`**

Returns a list of restaurants including their address and menu items.

**Example response:**

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

Sorting by rating (descending) is supported using query parameters:

```
GET /restaurants?sort=rating&direction=desc
```

### **Test cases (3 tests)**

13. **G1 – Restaurants include their addresses**

    After creating a restaurant and its address, `GET /restaurants` must return an object containing an `address` field (not `null`).

14. **G2 – Restaurants include their menu-items**

    After creating one or more menu items for a restaurant, `GET /restaurants` must include them in the `menuItems` array.

15. **G3 – Restaurants can be sorted descending by rating**

    When calling:

    ```
    GET /restaurants?sort=rating&direction=desc
    ```

    the returned list must be sorted in descending order by rating.

---

## **5. `PUT /restaurants/:restaurantId`**

**Expected request body:**

```json
{
  "name": "La Bunica Renovata",
  "rating": 5
}
```

### **Test cases (3 tests)**

16. **U1 – Updating with malformed body**

    If `name` or `rating` is missing:
    - status `400`
    - body: `{"message": "malformed request"}`

17. **U2 – Updating with invalid rating**

    If `rating` is not in `[1, 5]`:
    - status `400`
    - body: `{"message": "rating should be between 1 and 5"}`

18. **U3 – Valid restaurant update**
    - restaurant is updated
    - status `200`
    - body: `{"message": "updated"}`

If the restaurant does not exist:

```json
{ "message": "restaurant not found" }
```

with status `404` is acceptable.

---

## **6. `DELETE /restaurants/:restaurantId`**

Deletes a restaurant and all associated data (address, menu items).
The restaurant must no longer appear in `GET /restaurants`.

### **Test cases (2 tests)**

19. **D1 – Deleting a non-existing restaurant**
    - status `404`
    - body: `{"message": "restaurant not found"}`

20. **D2 – Valid restaurant deletion**
    - restaurant and related data are removed
    - status `200`
    - body: `{"message": "deleted"}`
