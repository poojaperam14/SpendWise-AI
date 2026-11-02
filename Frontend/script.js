
const API_URL = "http://localhost:5000/api/transactions";

let totalIncome = 0;
let totalExpenses = 0;
let transactions = [];
let monthlyChart = null;

const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const filterType = document.getElementById("filterType");
const filterDate = document.getElementById("filterDate");
const clearDateFilter = document.getElementById("clearDateFilter");
const categorySummary = document.getElementById("categorySummary");

const budgetForm = document.getElementById("budgetForm");
const budgetSummary = document.getElementById("budgetSummary");

// Show API errors
function showError(error) {
    console.error(error);
    alert(error.message || "Something went wrong. Please try again.");
}

// Get current month key
function getCurrentMonthKey() {
    const now = new Date();

    return now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0");
}

// Get transaction month
function getTransactionMonth(item) {
    const date = item.date ? new Date(item.date) : new Date();

    if (isNaN(date.getTime())) {
        return getCurrentMonthKey();
    }

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0");
}

// Format transaction date
function formatTransactionDate(item) {
    if (!item.date) return "Date unavailable";

    const date = new Date(item.date);

    if (isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Fetch transactions from MongoDB
async function loadTransactions() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load transactions.");
        }

        transactions = await response.json();

        displayTransactions();
        updateDashboard();

    } catch (error) {
        showError(error);
    }
}

// Update dashboard
function updateDashboard() {
    totalIncome = 0;
    totalExpenses = 0;

    transactions.forEach(function(item) {
        const amount = Number(item.amount) || 0;

        if (item.type === "income") {
            totalIncome += amount;
        } else if (item.type === "expense") {
            totalExpenses += amount;
        }
    });

    document.getElementById("income").textContent =
        "₹" + totalIncome.toLocaleString("en-IN");

    document.getElementById("expenses").textContent =
        "₹" + totalExpenses.toLocaleString("en-IN");

    document.getElementById("balance").textContent =
        "₹" + (totalIncome - totalExpenses).toLocaleString("en-IN");

    displayCategorySummary();
    displayMonthlyChart();
    displayBudget();
    displayReports();
}

// Expense by category
function displayCategorySummary() {
    categorySummary.innerHTML = "";

    let categoryTotals = {};

    transactions.forEach(function(item) {
        if (item.type === "expense") {
            const category = item.category || "Other";

            categoryTotals[category] =
                (categoryTotals[category] || 0) + Number(item.amount || 0);
        }
    });

    if (Object.keys(categoryTotals).length === 0) {
        categorySummary.textContent = "No expenses added yet.";
        return;
    }

    for (let category in categoryTotals) {
        const categoryItem = document.createElement("div");
        categoryItem.className = "category-item";

        const name = document.createElement("span");
        name.textContent = category;

        const amount = document.createElement("span");
        amount.textContent =
            "₹" + categoryTotals[category].toLocaleString("en-IN");

        categoryItem.appendChild(name);
        categoryItem.appendChild(amount);

        categorySummary.appendChild(categoryItem);
    }
}

// Monthly income and expense chart
function displayMonthlyChart() {
    const monthlyData = {};

    transactions.forEach(function(item) {
        const month = getTransactionMonth(item);

        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expense: 0 };
        }

        const amount = Number(item.amount) || 0;

        if (item.type === "income") {
            monthlyData[month].income += amount;
        } else if (item.type === "expense") {
            monthlyData[month].expense += amount;
        }
    });

    const labels = Object.keys(monthlyData).sort();

    const incomeData = labels.map(function(month) {
        return monthlyData[month].income;
    });

    const expenseData = labels.map(function(month) {
        return monthlyData[month].expense;
    });

    const monthNames = labels.map(function(month) {
        const parts = month.split("-");

        return new Date(Number(parts[0]), Number(parts[1]) - 1)
            .toLocaleString("en-IN", {
                month: "short",
                year: "numeric"
            });
    });

    const ctx = document.getElementById("monthlyChart");

    if (!ctx || typeof Chart === "undefined") return;

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: "Income",
                    data: incomeData,
                    backgroundColor: "#2563eb"
                },
                {
                    label: "Expenses",
                    data: expenseData,
                    backgroundColor: "#ef4444"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Display monthly budget
function displayBudget() {
    const budgetKey = "monthlyBudget_" + getCurrentMonthKey();
    const budget = Number(localStorage.getItem(budgetKey)) || 0;

    let monthlyExpenses = 0;

    transactions.forEach(function(item) {
        if (
            item.type === "expense" &&
            getTransactionMonth(item) === getCurrentMonthKey()
        ) {
            monthlyExpenses += Number(item.amount) || 0;
        }
    });

    if (budget <= 0) {
        budgetSummary.innerHTML = "<p>Please set your monthly budget.</p>";
        return;
    }

    const remaining = budget - monthlyExpenses;
    const percentage = (monthlyExpenses / budget) * 100;
    const progress = Math.min(percentage, 100);

    budgetSummary.innerHTML = `
        <p><strong>Monthly Budget:</strong> ₹${budget.toLocaleString("en-IN")}</p>
        <p><strong>Spent:</strong> ₹${monthlyExpenses.toLocaleString("en-IN")}</p>
        <p><strong>Remaining:</strong> ₹${remaining.toLocaleString("en-IN")}</p>

        <div class="budget-progress">
            <div class="budget-progress-fill"
                 style="width: ${progress}%"></div>
        </div>

        <p>${percentage.toFixed(1)}% of your budget used.</p>

        <p class="budget-message">
            ${remaining < 0
                ? "Warning! You have exceeded your monthly budget."
                : remaining === 0
                    ? "You have used your entire budget."
                    : "You are within your monthly budget."}
        </p>
    `;
}

// Set monthly budget
budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const budget = Number(
        document.getElementById("budgetAmount").value
    );

    if (!Number.isFinite(budget) || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    const budgetKey = "monthlyBudget_" + getCurrentMonthKey();

    localStorage.setItem(budgetKey, budget);

    displayBudget();
    budgetForm.reset();

    alert("Monthly budget saved successfully!");
});

// Reports and Analytics
function displayReports() {
    let income = 0;
    let expenses = 0;
    let categoryTotals = {};

    transactions.forEach(function(item) {
        const amount = Number(item.amount) || 0;

        if (item.type === "income") {
            income += amount;
        } else if (item.type === "expense") {
            expenses += amount;

            const category = item.category || "Other";

            categoryTotals[category] =
                (categoryTotals[category] || 0) + amount;
        }
    });

    const savings = income - expenses;

    const rate = income > 0
        ? (savings / income) * 100
        : 0;

    let highestCategory = "-";
    let highestAmount = 0;

    for (const category in categoryTotals) {
        if (categoryTotals[category] > highestAmount) {
            highestAmount = categoryTotals[category];
            highestCategory = category;
        }
    }

    document.getElementById("reportSavings").textContent =
        "₹" + savings.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    document.getElementById("savingsRate").textContent =
        rate.toFixed(1) + "%";

    document.getElementById("highestCategory").textContent =
        highestCategory;

    document.getElementById("financialSummary").innerHTML = `
        <p><strong>Total Income:</strong> ₹${income.toLocaleString("en-IN")}</p>
        <p><strong>Total Expenses:</strong> ₹${expenses.toLocaleString("en-IN")}</p>
        <p><strong>Total Savings:</strong> ₹${savings.toLocaleString("en-IN")}</p>
        <p><strong>Highest Spending:</strong> ${highestCategory}
        ${highestAmount > 0
            ? "(₹" + highestAmount.toLocaleString("en-IN") + ")"
            : ""}</p>
    `;
}

// Display transactions
function displayTransactions() {
    transactionList.innerHTML = "";

    const selectedType = filterType.value;
    const selectedDate = filterDate.value;

    transactions.forEach(function(item) {
        if (
            selectedType !== "all" &&
            item.type !== selectedType
        ) {
            return;
        }

        if (selectedDate) {
            if (!item.date) return;

            const transactionDate = new Date(item.date);

            if (isNaN(transactionDate.getTime())) return;

            const localDate =
                transactionDate.getFullYear() + "-" +
                String(transactionDate.getMonth() + 1).padStart(2, "0") +
                "-" +
                String(transactionDate.getDate()).padStart(2, "0");

            if (localDate !== selectedDate) return;
        }

        const transaction = document.createElement("div");
        transaction.className = "transaction";

        const details = document.createElement("div");
        details.className = "transaction-details";

        const name = document.createElement("strong");
        name.textContent = item.title;

        const category = document.createElement("span");
        category.textContent = item.category;

        const date = document.createElement("small");
        date.textContent = formatTransactionDate(item);

        details.appendChild(name);
        details.appendChild(category);
        details.appendChild(date);

        const value = document.createElement("span");
        value.className = item.type === "income"
            ? "income-amount"
            : "expense-amount";

        value.textContent =
            (item.type === "income" ? "+ ₹" : "- ₹") +
            Number(item.amount).toLocaleString("en-IN");

        // Edit transaction
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", async function() {
            const newTitle = prompt(
                "Enter new transaction name:",
                item.title
            );

            if (newTitle === null) return;

            if (newTitle.trim() === "") {
                alert("Name cannot be empty.");
                return;
            }

            const newAmount = prompt(
                "Enter new amount:",
                item.amount
            );

            if (newAmount === null) return;

            if (
                newAmount.trim() === "" ||
                !Number.isFinite(Number(newAmount)) ||
                Number(newAmount) <= 0
            ) {
                alert("Please enter a valid amount.");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/${item._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: newTitle.trim(),
                        amount: Number(newAmount),
                        type: item.type,
                        category: item.category
                    })
                });

                if (!response.ok) {
                    throw new Error("Could not update transaction.");
                }

                await loadTransactions();
                alert("Transaction updated successfully!");

            } catch (error) {
                showError(error);
            }
        });

        // Delete transaction
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", async function() {
            if (!confirm("Are you sure you want to delete this transaction?")) {
                return;
            }

            try {
                const response = await fetch(`${API_URL}/${item._id}`, {
                    method: "DELETE"
                });

                if (!response.ok) {
                    throw new Error("Could not delete transaction.");
                }

                await loadTransactions();
                alert("Transaction deleted successfully!");

            } catch (error) {
                showError(error);
            }
        });

        transaction.appendChild(details);
        transaction.appendChild(value);
        transaction.appendChild(editButton);
        transaction.appendChild(deleteButton);

        transactionList.appendChild(transaction);
    });

    if (transactionList.children.length === 0) {
        transactionList.textContent = "No transactions found.";
    }
}

// Add transaction
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;

    if (!title || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid name and amount.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                amount,
                type,
                category
            })
        });

        if (!response.ok) {
            throw new Error("Could not add transaction.");
        }

        await loadTransactions();

        form.reset();
        alert("Transaction added successfully!");

    } catch (error) {
        showError(error);
    }
});

// Filter transactions
filterType.addEventListener("change", displayTransactions);
filterDate.addEventListener("change", displayTransactions);

// Clear date filter
clearDateFilter.addEventListener("click", function() {
    filterDate.value = "";
    displayTransactions();
});

// Load transactions when the page opens
loadTransactions();
