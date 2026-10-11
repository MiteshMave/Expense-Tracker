
import { useEffect, useState } from "react";
import "./App.css";
import Reports from "./Reports";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
 const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState("all");
const [filterCategory, setFilterCategory] = useState("all");

 useEffect(() => {
  fetch("http://localhost:5000/api/transactions")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    })
    .then((data) => {
      setTransactions(data);
    })
    .catch((error) => {
      console.error("Error fetching transactions:", error);
    });
}, []);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

 const totalIncome = transactions
  .filter((item) => item.type === "income")
  .reduce((sum, item) => sum + Number(item.amount), 0);

const totalExpenses = transactions
  .filter((item) => item.type === "expense")
  .reduce((sum, item) => sum + Number(item.amount), 0);

const balance = totalIncome - totalExpenses;

  const filteredTransactions = transactions.filter((item) => {
  const matchesSearch = item.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesType =
    filterType === "all" || item.type === filterType;

  const matchesCategory =
    filterCategory === "all" ||
    item.category === filterCategory;

  return matchesSearch && matchesType && matchesCategory;
});

async function handleSubmit(event) {
  event.preventDefault();

  if (!title.trim() || !amount || Number(amount) <= 0 || !date) {
    alert("Please enter valid transaction details.");
    return;
  }

  const transactionData = {
    title: title.trim(),
    amount: Number(amount),
    type,
    category,
    date,
  };

  const isEditing = editingId !== null;

  try {
    const response = await fetch(
      isEditing
        ? `http://localhost:5000/api/transactions/${editingId}`
        : "http://localhost:5000/api/transactions",
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save transaction.");
    }

    const savedTransaction = await response.json();

    if (isEditing) {
      setTransactions((previous) =>
        previous.map((item) =>
          item._id === editingId ? savedTransaction : item
        )
      );
    } else {
      setTransactions((previous) => [
        savedTransaction,
        ...previous,
      ]);
    }

    setTitle("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    setDate(new Date().toLocaleDateString("en-CA"));
    setEditingId(null);

    alert(
      isEditing
        ? "Transaction updated successfully!"
        : "Transaction added successfully!"
    );
  } catch (error) {
    console.error("Error saving transaction:", error);
    alert("Could not save transaction. Please check the backend.");
  }
}

  
async function deleteTransaction(id) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/transactions/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete transaction.");
    }

    setTransactions((previous) =>
      previous.filter((item) => item._id !== id)
    );
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("Could not delete transaction. Please try again.");
  }
}


function exportTransactions() {
  if (filteredTransactions.length === 0) {
    alert("No transactions available to export.");
    return;
  }

  const headers = [
    "Title",
    "Amount",
    "Type",
    "Category",
    "Date",
  ];

  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = filteredTransactions.map((item) => [
    item.title,
    item.amount,
    item.type,
    item.category || "Other",
    item.date,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "expense-transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}


  function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  }


  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">₹</span>
          <span>ExpenseFlow</span>
        </div>

        <p className="nav-label">MENU</p>
        <button
        type="button"
        className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}
        onClick={() => setActivePage("Dashboard")}
      >
        ▦ &nbsp; Dashboard
      </button>

      <button
        type="button"
        className={`nav-item ${activePage === "Transactions" ? "active" : ""}`}
        onClick={() => setActivePage("Transactions")}
      >
        ↔ &nbsp; Transactions
      </button>

      <button
        type="button"
        className={`nav-item ${activePage === "Reports" ? "active" : ""}`}
        onClick={() => setActivePage("Reports")}
      >
        ▤ &nbsp; Reports
      </button>

        <div className="sidebar-bottom">
          <div className="avatar">M</div>
          <div>
            <strong>My Account</strong>
            <p>Personal Finance</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>{activePage}</h1>
            <p className="subtitle">
              Track your money. Make smarter decisions.
            </p>
          </div>
          <div className="today">
            <span>Today</span>
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </header>
        {activePage === "Dashboard" && (
          <>
        <section className="summary-grid">
          <div className="summary-card balance-card">
            <div className="card-top">
              <span>Total Balance</span>
              <span className="card-icon">₹</span>
            </div>
            <h2>{formatCurrency(balance)}</h2>
            <p>Income minus expenses</p>
          </div>

          <div className="summary-card">
            <div className="card-top">
              <span>Total Income</span>
              <span className="card-icon income-icon">↗</span>
            </div>
            <h2>{formatCurrency(totalIncome)}</h2>
            <p className="positive">Money received</p>
          </div>

          <div className="summary-card">
            <div className="card-top">
              <span>Total Expenses</span>
              <span className="card-icon expense-icon">↘</span>
            </div>
            <h2>{formatCurrency(totalExpenses)}</h2>
            <p className="negative">Money spent</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h2>Add Transaction</h2>
                <p>Record your income or expenses.</p>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Transaction Name</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Grocery shopping"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />

              <label>Transaction Type</label>
              <div className="type-selector">
                <button
                  type="button"
                  className={type === "expense" ? "type-btn selected expense-selected" : "type-btn"}
                  onClick={() => setType("expense")}
                >
                  ↘ Expense
                </button>
                <button
                  type="button"
                  className={type === "income" ? "type-btn selected income-selected" : "type-btn"}
                  onClick={() => setType("income")}
                >
                  ↗ Income
                </button>
              </div>

              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Education</option>
                <option>Entertainment</option>
                <option>Bills</option>
                <option>Allowance</option>
                <option>Salary</option>
                <option>Other</option>
              </select>

              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />

              <button className="submit-btn" type="submit">
                + Add Transaction
              </button>
            </form>
          </div>

          <div className="panel transactions-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent Transactions</h2>
                <p>Your latest money activity.</p>
              </div>
              <span className="transaction-count">
                {transactions.length} total
              </span>
            </div>
            
            <div className="transaction-filters">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <select
                value={filterType}
                onChange={(event) => setFilterType(event.target.value)}
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bills">Bills</option>
                <option value="Allowance">Allowance</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>


           {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <span>₹</span>
                <h3>No transactions yet</h3>
                <p>Add your first transaction using the form.</p>
              </div>
            ) : (
              <div className="transaction-list">
                {filteredTransactions.map((item) => (
                  <div className="transaction-item" key={item._id}>
                    <div
                      className={
                        item.type === "income"
                          ? "transaction-icon income-bg"
                          : "transaction-icon expense-bg"
                      }
                    >
                      {item.type === "income" ? "↗" : "↘"}
                    </div>

                    <div className="transaction-details">
                      <strong>{item.title}</strong>
                      <span>
                        {item.category} · {item.date}
                      </span>
                    </div>

                    <div className="transaction-right">
                      <strong
                        className={
                          item.type === "income"
                            ? "income-amount"
                            : "expense-amount"
                        }
                      >
                        {item.type === "income" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </strong>
                      <button
                        className="delete-btn"
                        type="button"
                        onClick={() => deleteTransaction(item._id)}
                        aria-label={`Delete ${item.title}`}
                        title="Delete transaction"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
          </>
)}
{activePage === "Transactions" && (
  <section className="transactions-page">
    <div className="transactions-page-header">
      <div>
        <h2>All Transactions</h2>
        <p>View and manage all your income and expenses.</p>
      </div>

      <span className="transaction-count">
        {filteredTransactions.length} Transactions
      </span>
      
      <button
        type="button"
        className="export-button"
        onClick={exportTransactions}
      >
        ↓ Export CSV
      </button>
    </div>

    <div className="transactions-page-filters">
      <input
        type="text"
        placeholder="Search transactions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expenses</option>
      </select>

      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        {[...new Set(transactions.map((item) => item.category || "Other"))]
          .map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
      </select>
    </div>

    <div className="transactions-page-list">
      {filteredTransactions.length === 0 ? (
        <p className="empty-transactions">
          No transactions found. Try changing your search or filters.
        </p>
      ) : (
        filteredTransactions.map((item) => (
          <div className="transaction-row" key={item._id}>
            <div className="transaction-info">
              <strong>{item.title}</strong>
              <span>
                {item.category || "Other"} · {item.date}
              </span>
            </div>

            <strong
              className={
                item.type === "income"
                  ? "income-amount"
                  : "expense-amount"
              }
            >
              {item.type === "income" ? "+" : "-"}
              {formatCurrency(Number(item.amount))}
            </strong>

            <button
              type="button"
              className="delete-button"
              onClick={() => deleteTransaction(item._id)}
            >
              Delete
            </button>
                        
            <button
              type="button"
              className="edit-button"
              onClick={() => {
                setTitle(item.title);
                setAmount(String(item.amount));
                setType(item.type);
                setCategory(item.category || "Food");
                setDate(
                  item.date
                    ? String(item.date).slice(0, 10)
                    : new Date().toLocaleDateString("en-CA")
                );
                setEditingId(item._id);
                setActivePage("Dashboard");
              }}
            >
              Edit
            </button>

          </div>
        ))
      )}
    </div>
  </section>
)}
       {activePage === "Reports" && (
  <Reports transactions={transactions} />
)}

        <footer>
          ExpenseFlow · Manage your money with confidence.
        </footer>
      </main>
    </div>
  );
}

export default App;
