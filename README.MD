
## 🧰 Prerequisites

* **Node.js**: v18 or v20 (recommended)
* **npm**


---

## ⚙️ Setup & Run

### 1️⃣ Use the public npm registry
npm config set registry https://registry.npmjs.org/


### 2️⃣ Install dependencies
npm install


### 3️⃣ Use the correct Node version
Make sure you have Node.js v18 or v20 installed

# Verify your Node version:
node -v


---

## ▶️ Running the Server

### Development mode
npm run dev


### Watch mode (recommended)
# Auto-restarts the server on file changes.
# (by using this, Now you can edit code and see changes immediately in GraphQL Yoga! )

npm run dev:watch


📍 **Server URL:**
http://localhost:4000/graphql


## 🧪 Running Tests

# Run the full test suite:
npm test


> NOTE:  ℹ️ Tests use timestamp-based IDs (e.g., `test_flow_1769984076601`) to avoid collisions. If tests are interrupted, manual cleanup may be required.

---

## 🔐 Required Headers

When using **GraphQL Yoga Playground**, open the **Headers** tab and add:

{
  "client": "your-client-name"
}


---

## 🔍 Test Queries

### Fetch an address
{
  address(username: "jack") {
    street
    city
    state
    zipcode
  }
}


### Create a new address

mutation {
  createAddress(
    username: "alice"
    address: {
      street: "123 Main St"
      city: "Portland"
      state: "Oregon"
      zipcode: "97201"
    }
  ) {
    street
    city
    state
    zipcode
  }
}


## 📚 What This Project Includes

This implementation covers 7 tickets:

Ticket 1: Added `state` field to the `Address` schema
Ticket 2: `createAddress` mutation with duplicate prevention
Ticket 3:Client header validation
Ticket 4: Request ID tracking in all logs
Ticket 5: Client name included in all logs
Ticket 6: Request ID returned in response metadata
Ticket 7: Comprehensive test suite (18 tests)

---

## 🧠 How to Review This Code

If you’re reviewing this project:

* 📖 **Read the comments** – every file is documented like a story
* 🧪 **Read the tests** – they explain the flow step by step
* ▶️ **Run the app** – use `npm run dev:watch` and try queries
* 📜 **Check the logs** – Winston logs clearly show request flow and context


## what else we can do more to this project?


--> Current: I manually keep GraphQL schema and TypeScript types synchronized by checking both files match.
Better: Use GraphQL Code Generator to automatically generate TypeScript types from the schema, ensuring they always stay in sync.

--> Current: All error messages follow the same format with helpful text like "Address not found" and error codes.
Better: Create a central error helper that automatically formats all errors the same way, so we can't accidentally write inconsistent messages.

--> Current: Address is queried separately using address(username: "jack"), which works but requires multiple queries for user data.
Better: Add a User type with a nested address field, so one query like user(username: "jack") { name, address { street } } gets everything at once.

--> Current: I use Envelop plugins that run automatically for every resolver, handling request IDs, logging, and header validation in one place instead of repeating code.






#  Built to be readable, testable, and production-minded.
