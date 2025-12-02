import React, { useState } from "react";
import axios from "../services/api";
import { Line } from "react-chartjs-2";
import { Container, Row, Col, Card, Button, Form, Table } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CustomerModule() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add Customer locally (for small demo)
  const addCustomer = () => {
    if (!name) return;
    setCustomers([...customers, { name, phone }]);
    setName("");
    setPhone("");
  };

  // Upload CSV for ML Analytics
  const uploadCSV = async () => {
    if (!csvFile) {
      setError("Please choose a CSV file first");
      return;
    }
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const res = await axios.post("/customer-analytics", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to run analytics. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-3 shadow mb-4">
        <h3>Customer Management</h3>
        <Row>
          <Col md={4}>
            <Form.Control
              placeholder="Customer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-2"
            />
          </Col>

          <Col md={4}>
            <Form.Control
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-2"
            />
          </Col>

          <Col md={4}>
            <Button className="w-100" onClick={addCustomer}>
              Add Customer
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="p-3 shadow mb-4">
        <h4>Customer List</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="p-3 shadow mb-4">
        <h3>Customer Data Analytics (AI Powered)</h3>
        <p className="text-muted">
          Upload customer + dispatch CSV file to generate AI insights.<br/>
          Required CSV columns: <code>customer_name,date,total</code>
        </p>

        <Row className="mb-3">
          <Col md={8}>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
            />
          </Col>
          <Col md={4}>
            <Button className="w-100" onClick={uploadCSV} disabled={loading}>
              {loading ? "Running..." : "Run Analytics"}
            </Button>
          </Col>
        </Row>

        {error && <div className="text-danger mb-2">{error}</div>}

        {analytics && (
          <div>
            <Card className="p-3 mb-4">
              <h5>Top Customers (By Revenue)</h5>
              <ul>
                {analytics.top_customers.map((item, index) => (
                  <li key={index}>
                    {item.customer} – Rs {item.revenue}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-3 mb-4">
              <h5>Revenue Trend</h5>
              <Line
                data={{
                  labels: analytics.months,
                  datasets: [
                    {
                      label: "Revenue (PKR)",
                      data: analytics.revenue_trend,
                      fill: false,
                    },
                  ],
                }}
                options={{ responsive: true }}
              />
            </Card>

            <Card className="p-3 mb-4">
              <h5>Predicted Next Month Revenue</h5>
              <h2 className="text-success">Rs {analytics.prediction}</h2>
            </Card>

            <Card className="p-3 mb-4">
              <h5>Detected Anomalies (Possible Errors/Fraud)</h5>
              {analytics.anomalies.length === 0 ? (
                <p>No anomalies detected ✔</p>
              ) : (
                <ul>
                  {analytics.anomalies.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </Card>
    </Container>
  );
}
