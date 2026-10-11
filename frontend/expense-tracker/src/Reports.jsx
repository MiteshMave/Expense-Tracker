
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#7952D6",
  "#A78BFA",
  "#5B8DEF",
  "#35B89A",
  "#F5A65B",
  "#E879A9",
  "#8B9BB4",
  "#D97757",
  "#64748B",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Reports({ transactions }) {
    const highestExpenseCategory = transactions
    .filter((item) => item.type === "expense")
    .reduce((totals, item) => {
      const category = item.category || "Other";
      totals[category] =
        (totals[category] || 0) + Number(item.amount);
      return totals;
    }, {});

  const highestCategory = Object.entries(highestExpenseCategory)
    .sort((a, b) => b[1] - a[1])[0];

  const highestCategoryName = highestCategory
    ? highestCategory[0]
    : "No expenses";
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const overviewData = [
    { name: "Income", amount: income },
    { name: "Expenses", amount: expenses },
  ];
  // Calculate monthly expenses
const monthlyTotals = transactions
  .filter((item) => item.type === "expense")
  .reduce((result, item) => {
    const transactionDate = new Date(item.date);

    if (Number.isNaN(transactionDate.getTime())) {
      return result;
    }

    const monthKey = `${transactionDate.getFullYear()}-${String(
      transactionDate.getMonth() + 1
    ).padStart(2, "0")}`;

    result[monthKey] =
      (result[monthKey] || 0) + Number(item.amount);

    return result;
  }, {});

const monthlyData = Object.entries(monthlyTotals)
  .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
  .map(([month, amount]) => {
    const [year, monthNumber] = month.split("-");

    return {
      month: new Date(
        Number(year),
        Number(monthNumber) - 1,
        1
      ).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      amount,
    };
  });

  const categoryTotals = transactions
    .filter((item) => item.type === "expense")
    .reduce((result, item) => {
      const category = item.category || "Other";
      result[category] =
        (result[category] || 0) + Number(item.amount);
      return result;
    }, {});

  const categoryData = Object.entries(categoryTotals).map(
    ([name, amount]) => ({ name, amount })
  );

  return (
    <section className="reports-page">
  <div className="report-summary-grid">
    <div className="summary-card">
      <p>Total Income</p>
      <h2>{formatCurrency(income)}</h2>
    </div>

    <div className="summary-card">
      <p>Total Expenses</p>
      <h2>{formatCurrency(expenses)}</h2>
    </div>

    <div className="summary-card">
      <p>Net Savings</p>
      <h2>{formatCurrency(income - expenses)}</h2>
    </div>

    <div className="summary-card">
      <p>Highest Expense Category</p>
      <h2>{highestCategoryName}</h2>
    </div>
  </div>


  <section className="reports-section">
      <div className="report-card">
        <h2>Income vs Expenses</h2>
        <p className="report-subtitle">
          Compare your total income and spending.
        </p>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  value >= 1000 ? `${value / 1000}k` : value
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Amount",
                ]}
              />
              <Bar
                dataKey="amount"
                fill="#7952D6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="report-card">
        <h2>Category-wise Expenses</h2>
        <p className="report-subtitle">
          See where your money is going.
        </p>

        {categoryData.length === 0 ? (
          <div className="chart-empty">
            No expense data available yet.
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={85}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(Number(value))
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
            {/* Monthly Expenses Report */}
      <div className="report-card">
        <h2>Monthly Expenses</h2>
        <p className="report-subtitle">
          Track your spending month by month.
        </p>

        {monthlyData.length === 0 ? (
          <div className="chart-empty">
            No monthly expense data available yet.
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Expenses",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#7952D6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
    </section>
  );
}

export default Reports;
