# API Documentation — cloud.txt API

The Google Apps Script backend acts as a serverless REST-like JSON API. It accepts incoming GET and POST requests.

## Base URL
The API URL is obtained upon deploying the Google Apps Script project as a **Web App** (e.g. `https://script.google.com/macros/s/.../exec`).

## Endpoints

### 1. GET Requests
Append `?action=[ACTION]` to the Web App URL.

#### `GET ?action=ping`
Returns the status of the API.
- **Response**: `{"success": true, "message": "cloud.txt Receipt API is running!"}`

#### `GET ?action=getConfig`
Returns the configuration parameters of the business.
- **Response**:
```json
{
  "success": true,
  "config": {
    "businessName": "cloud.txt",
    "currency": "₹",
    "gstEnabled": true,
    "gstRate": 18
  }
}
```

#### `GET ?action=getReceipts`
Retrieves the history of all processed receipts.

#### `GET ?action=getDashboard`
Retrieves aggregated statistics for the dashboard (revenue, payment breakdown, top items).

### 2. POST Requests
Send a POST request with JSON body.

#### `POST` with body:
```json
{
  "action": "createReceipt",
  "formData": {
    "customerName": "Customer Name",
    "mobile": "1234567890",
    "paymentMethod": "Cash",
    "items": [
      { "name": "Item A", "quantity": 2, "price": 100 }
    ]
  }
}
```
Processes the receipt, updates Sheets, generates a PDF, and returns a success status.\n