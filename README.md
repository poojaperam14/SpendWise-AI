# SpendWise AI 💰

**A Personal Expense Management System**

SpendWise AI is a web-based expense management application. It helps users track income, manage expenses, set budgets, and understand spending habits.

## ✨ Features

- **Dashboard:** View total balance, income, and expenses.
- **Transaction Management:** Add, edit, delete, and view transactions.
- **Category Tracking:** Organize expenses by category.
- **Budget Management:** Set monthly budgets and track spending.
- **Reports & Analytics:** View savings, savings rate, and spending insights.
- **Monthly Charts:** Compare income and expenses visually.
- **Date Filtering:** Filter transactions by date.
- **Database Integration:** Store transactions in MongoDB.

## 🛠️ Technologies Used

- HTML
- CSS
- JavaScript
- Chart.js
- Node.js
- Express.js
- MongoDB
- Mongoose

## 📁 Project Structure

```text
SpendWise-AI/
│
├── Frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── Backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── database/
├── .gitignore
└── README.md
```

## 🚀 How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/poojaperam14/SpendWise-AI.git
```

### 2. Install Backend Dependencies

```bash
cd SpendWise-AI/Backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `Backend` folder.

Add your MongoDB connection string:

```env
MONGO_URI=your_mongodb_connection_string
```

### 4. Start the Backend

```bash
npm start
```

The backend runs at:

`http://localhost:5000`

### 5. Open the Frontend

Open `Frontend/index.html` in your browser using VS Code Live Server.

## 🔮 Future Improvements

- User authentication and secure accounts.
- Downloadable expense reports.
- More advanced financial insights.
- Responsive mobile-friendly design.

## 👩‍💻 Author

**Pooja Peram**

GitHub: [@poojaperam14](https://github.com/poojaperam14)

---

⭐ If you find this project useful, consider giving it a star!
