import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest

def run_customer_analytics(df):
    # Expected columns: customer_name, date, total
    required_cols = ['customer_name', 'date', 'total']
    for c in required_cols:
        if c not in df.columns:
            return {'error': f'Missing column: {c}'}

    # Convert types
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    df['total'] = pd.to_numeric(df['total'], errors='coerce').fillna(0)

    # Top customers
    top = df.groupby('customer_name')['total'].sum().sort_values(ascending=False).head(5).reset_index()
    top_customers = [{'customer': r['customer_name'], 'revenue': int(r['total'])} for _, r in top.iterrows()]

    # Monthly revenue trend
    df['month'] = df['date'].dt.strftime('%Y-%m')
    monthly = df.groupby('month')['total'].sum().reset_index().sort_values('month')
    months = monthly['month'].tolist()
    revenue_trend = monthly['total'].astype(int).tolist()

    # Simple linear regression for next month prediction
    if len(monthly) >= 2:
        monthly = monthly.reset_index(drop=True)
        monthly['mnum'] = range(1, len(monthly)+1)
        X = monthly[['mnum']]
        y = monthly['total']
        model = LinearRegression()
        model.fit(X, y)
        next_month = len(monthly) + 1
        pred = int(model.predict([[next_month]])[0])
    else:
        pred = int(monthly['total'].iloc[-1]) if len(monthly) == 1 else 0

    # Anomaly detection on 'total' using IsolationForest
    anomalies = []
    try:
        if len(df) >= 10:
            iso = IsolationForest(contamination=0.05, random_state=42)
            iso.fit(df[['total']])
            df['anomaly'] = iso.predict(df[['total']])
            anom = df[df['anomaly'] == -1]
            for _, row in anom.iterrows():
                anomalies.append(f"Date {row['date'].date()} — Suspicious total: {int(row['total'])}")
    except Exception:
        anomalies = []

    return {
        'top_customers': top_customers,
        'months': months,
        'revenue_trend': revenue_trend,
        'prediction': pred,
        'anomalies': anomalies
    }
