# CRM Platform

A lightweight CRM (Customer Relationship Management) platform designed to streamline client interactions and sales processes. This project is structured with a clear separation between the frontend and backend components, facilitating scalability and maintainability.

---

## 🚀 Project Overview

CRM Platform 0 aims to provide a foundational CRM system that can be extended and customized based on specific business needs. The project is divided into two main directories:

* `frontend/`: Contains the client-side application.
* `backend/`: Houses the server-side logic and API endpoints.

### 🖥️ Sample Screenshots

#### 📊 Dashboard

![Dashboard](./frontend.public/dashboard.png)

#### 👥 Customers

![Customers](./frontend.public/customers.png)

#### 🎯 Campaigns

![Campaigns](./frontend.public/campaigns.png)

#### ➕ Modal: Create Campaign

![Create Campaign Modal](./frontend.public/modal1.png)

#### ✏️ Modal: Edit Campaign

![Edit Campaign Modal](./frontend.public/model2.png)

---

## 🧠 AI Integration

The platform leverages **Gemini AI** to enhance usability and automate decision-making in the following areas:

* 📝 **Message Template Suggestions**: Auto-generates personalized and relevant message templates for campaigns.
* 🔍 **MongoDB Query Generation**: Converts natural language inputs into MongoDB queries to simplify advanced filtering.
* 🎯 **Segment Preview**: Uses AI to interpret segmentation rules written in natural language and preview matching customers.

These features streamline complex tasks, reduce manual effort, and empower non-technical users with powerful automation tools.

---

## 🛠️ Local Setup Instructions

Follow these steps to set up the project locally:

### Prerequisites

* **Node.js** (v14 or above)
* **npm** (v6 or above) or **yarn**
* **MongoDB** (Ensure MongoDB is installed and running)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_platform
```

Start backend:

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:

```bash
npm start
```

---

## 🧱 Architecture Diagram

```
+-----------------+       HTTP Requests        +-----------------+
|                 |-------------------------->|                 |
|   Frontend App  |                           |   Backend API   |
|  (React.js)     |<--------------------------| (Node.js/Express)|
|                 |       HTTP Responses      |                 |
+-----------------+                           +-----------------+
                                                       |
                                                       |
                                                       v
                                             +---------------------+
                                             |     MongoDB         |
                                             | (Database Storage)  |
                                             +---------------------+
```

---

## 🌐 API Endpoints Overview

### 🔐 Authentication Routes

| Route                   | Method | Description                      |
| ----------------------- | ------ | -------------------------------- |
| `/auth/login`           | POST   | Log in a user with credentials.  |
| `/auth/signup`          | POST   | Register a new user.             |
| `/auth/google`          | GET    | Initiate Google OAuth login.     |
| `/auth/google/callback` | GET    | OAuth callback for Google login. |

### 👥 Customer Routes

| Route                          | Method | Description                           |
| ------------------------------ | ------ | ------------------------------------- |
| `/api/customers/create`        | POST   | Create a new customer entry.          |
| `/api/customers/fetch`         | GET    | Fetch all customers.                  |
| `/api/customers/fetch/:custId` | GET    | Fetch details of a specific customer. |

### 👤 User Routes

| Route                | Method | Description                       |
| -------------------- | ------ | --------------------------------- |
| `/api/users/:userId` | GET    | Get a specific user's details.    |
| `/api/user`          | GET    | Get authenticated user's profile. |

### 📦 Order Routes

| Route                      | Method | Description                 |
| -------------------------- | ------ | --------------------------- |
| `/api/orders/create`       | POST   | Create a new order.         |
| `/api/orders/fetch`        | GET    | Retrieve all orders.        |
| `/api/orders/fetch/:ordId` | GET    | Get a specific order by ID. |

### 🧠 Segmentation Routes

| Route                   | Method | Description                                  |
| ----------------------- | ------ | -------------------------------------------- |
| `/api/segments/preview` | POST   | Preview segmentation rules on customer data. |
| `/api/segments/save`    | POST   | Save a segmentation rule.                    |
| `/api/segments/fetch`   | GET    | Fetch all saved segments.                    |

### 📣 Campaign Routes

| Route                   | Method | Description                       |
| ----------------------- | ------ | --------------------------------- |
| `/api/campaign/create`  | POST   | Create and launch a new campaign. |
| `/api/campaign/history` | GET    | Retrieve campaign history.        |

### 📨 Communication Log

| Route                         | Method | Description                                 |
| ----------------------------- | ------ | ------------------------------------------- |
| `/api/communicationLog/fetch` | GET    | Fetch communication logs for all campaigns. |

---

## 🤖 Technology Stack

### Frontend:

* React.js
* Axios
* React Router

### Backend:

* Node.js
* Express.js
* Mongoose (MongoDB ODM)

### Database:

* MongoDB

### AI:

* Gemini AI (for message suggestions, query generation, segment preview)

### Deployment:

* Vercel ([crmplatform.vercel.app](https://crmplatform.vercel.app))

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🤝 Contributions Welcome

Feel free to contribute to the project by submitting issues or pull requests. 
