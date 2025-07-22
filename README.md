# Smart Canteen Ordering System

A modern, full-stack web application designed to streamline the ordering process for a college canteen. This project provides a seamless experience for students to browse the menu and place orders, and a powerful dashboard for canteen administrators to manage orders and view key analytics.

---

## ✨ Key Features

This application is split into two main parts: the student-facing ordering system and the admin panel.

### 👨‍🎓 Student View (`/`)

* **Interactive Menu:** Students can browse a clean, visual menu of all available food items.
* **Shopping Cart:** A fully functional cart to add, update quantities, or remove items before ordering.
* **Simple Checkout:** Students can quickly place an order by providing their name and roll number.
* **Order Confirmation:** After placing an order, students are redirected to a confirmation page with a summary of their order details and a unique Order ID.

### 🔑 Admin Panel (`/admin`)

* **Secure Login:** A dedicated login page for administrators.
* **Live Order Dashboard (`/admin/orders`):**
    * View all incoming orders in real-time.
    * Orders are automatically sorted with new ("Placed") orders at the top.
    * Update order status from "Placed" to "Completed" with a single click.
    * Completed orders are visually distinguished for clarity.
* **Menu Management (`/admin/menu`):** A dedicated page to add, edit, or remove menu items from the canteen's offerings.
* **Basic Analytics (`/admin/dashboard`):**
    * Get a snapshot of the day's performance with key metrics like Total Revenue, Total Orders, Top Selling Item, and Most Profitable Item.

---

## 🛠️ Tech Stack

This project is built with a modern, robust, and scalable technology stack:

* **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose/MongoClient)
* **Deployment:** Vercel, Netlify, or any Node.js compatible platform.

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)
* `npm` or `yarn`
* A running [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud-based like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your MongoDB connection string:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    # or
    yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the student-facing menu.
Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the admin panel.

---

## 📁 Project Structure

The project follows the standard Next.js App Router structure.


.
├── app/
│   ├── (user)/             # Group for student-facing routes
│   │   ├── menu/
│   │   ├── cart/
│   │   └── order/[orderId]/
│   ├── admin/              # Group for admin routes
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── orders/
│   └── api/                # API routes
│       ├── orders/
│       └── analytics/
├── lib/
│   └── mongodb.ts          # MongoDB connection logic
└── ...


---

## 💡 Future Enhancements

* **Full Admin Authentication:** Implement a robust authentication system (e.g., NextAuth.js) for the admin panel.
* **Real-time Updates:** Use WebSockets (e.g., with Socket.io) for instant updates on the admin order page instead of polling.
* **Advanced Analytics Dashboard:** Enhance the dashboard with charts, historical data filtering (e.g., last week, last month), and more detailed insights.
* **Payment Integration:** Integrate a payment gateway like Stripe or Razorpay.
