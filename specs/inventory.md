# Inventory Page Test Plan

Application: https://playwright-workshop.pages.dev
Seed: `tests/seed.spec.ts`

The inventory page (`/inventory`) lists the store's products for a signed-in
user. Reaching it requires signing in as `standard_user` / `workshop123`
(client-side session). It shows six product cards, a sort dropdown, and a
cart link whose badge counts added items.

### 1. Product listing renders completely

**Steps:**
1. Sign in as `standard_user` and land on `/inventory`.
2. Observe the product grid.

**Expected:**
- Exactly 6 product cards are visible.
- Each card shows a name, a price in `$N.NN` format, and a stock note.
- The heading "Products" is visible.

### 2. Sorting by price, low to high

**Steps:**
1. Sign in and open `/inventory`.
2. Select "Price (low-high)" in the sort dropdown.

**Expected:**
- The first card is the cheapest product (Lab Notebook, $12.00).
- The last card is the most expensive product (Field Recorder, $199.00).

### 3. Out-of-stock product cannot be added

**Steps:**
1. Sign in and open `/inventory`.
2. Locate the Aeropress Go card.

**Expected:**
- Its stock note reads "Out of stock".
- Its add button is disabled and labelled "Unavailable".

### 4. Low-stock product is flagged

**Steps:**
1. Sign in and open `/inventory`.
2. Locate the Field Recorder card.

**Expected:**
- Its stock note reads "Only 1 left".
- Its add button is enabled.

### 5. Cart badge counts additions

**Steps:**
1. Sign in and open `/inventory`.
2. Add the Workshop Backpack, then the Lab Notebook.

**Expected:**
- After the first add, the cart badge shows "1".
- After the second add, the cart badge shows "2".
