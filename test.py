import pandas as pd

# Define the sample data
data = [
    {"title": "Grocery shopping", "amount": 85.50, "category": "Food & Dining", "date": "2025-06-05", "description": "Weekly groceries at Whole Foods"},
    {"title": "Bus pass", "amount": 45.00, "category": "Transportation", "date": "2025-06-01", "description": "Monthly public transport pass"},
    {"title": "New shoes", "amount": 120.00, "category": "Shopping", "date": "2025-06-03", "description": "Nike running shoes"},
    {"title": "Movie night", "amount": 15.00, "category": "Entertainment", "date": "2025-06-06", "description": "Tickets for evening show"},
    {"title": "Electric bill", "amount": 95.25, "category": "Bills & Utilities", "date": "2025-06-02", "description": "Monthly electricity usage"},
    {"title": "Doctor visit", "amount": 150.00, "category": "Healthcare", "date": "2025-06-04", "description": "General check-up"},
    {"title": "Online course", "amount": 60.00, "category": "Education", "date": "2025-06-07", "description": "Udemy Python course"},
    {"title": "Weekend trip", "amount": 300.00, "category": "Travel", "date": "2025-06-08", "description": "Hotel and transport for short trip"},
    {"title": "Gift for friend", "amount": 40.00, "category": "Other", "date": "2025-06-05", "description": "Birthday gift"},
]

# Create a DataFrame
df = pd.DataFrame(data)

# Save to CSV
df.to_csv("sample_expenses.csv", index=False)
