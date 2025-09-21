# Railrtrace Project

This project is a full-stack web application designed to track railway track fittings using a hierarchical lot-batch-item system. It includes a vendor portal for managing orders and generating QR codes.

## Technology Stack

- **Backend:** Node.js, Express.js, PostgreSQL, bcrypt, qrcode
- **Frontend:** React (Vite), JavaScript, Axios
- **Database:** PostgreSQL

---

## Setup and Installation

### 1. Database Setup

1.  **Install PostgreSQL:** If you haven't already, install PostgreSQL on your system.
2.  **Create Database:** Create a new database named `railtrace_db`.
3.  **Run SQL Script:** Execute the entire script located in `database.sql` in your pgAdmin or preferred SQL client. This will create all the necessary tables and insert mock data to get you started.

### 2. Backend Setup

1.  **Navigate to Backend:**
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Update Credentials:**
    - Open `backend/index.js`.
    - Find the `Pool` configuration block.
    - **Crucially, change `YOUR_REAL_PASSWORD`** to your actual PostgreSQL password.

4.  **Start the Server:**
    ```bash
    npm start
    ```
    The backend server will be running at `http://localhost:3000`.

### 3. Frontend Setup

1.  **Navigate to Frontend:**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Application:**
    ```bash
    npm run dev
    ```
    The frontend development server will start, typically at `http://localhost:5173`.

---

## How to Use

1.  Open your browser to the frontend URL (e.g., `http://localhost:5173`).
2.  Log in using the mock vendor credentials:
    - **Vendor ID:** `V-001`
    - **Password:** `password123`
3.  You will see the vendor dashboard with orders categorized into "Pending", "In Process", and "Completed".
4.  Click the "Generate QR" button on a pending order to create and display the QR codes.

## API Endpoints

- `POST /api/vendor/register`: Registers a new vendor.
- `POST /api/vendor/login`: Authenticates a vendor and returns their details.
- `GET /api/vendor/dashboard/:vendor_id`: Fetches all orders for a vendor, categorized by status.
- `POST /api/vendor/generate-qr`: Generates QR codes for a specific order. Handles both `batch_wise` and `item_wise` orders.
- `POST /api/vendor/mark-printed`: Updates the status of a batch or fitting to `printed`. (For machine integration simulation).
"# railtrace" 
