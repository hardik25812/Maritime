---
description: Fix n8n Google Sheets node schema mismatch by using HTTP Request node instead
---

# Fix: Google Sheets Node "Column names were updated after the node's setup" Error

## Problem

The n8n Google Sheets node (v4.7) performs strict schema validation at runtime. It compares the column headers stored in its internal schema cache against the actual Google Sheet headers. If there is ANY mismatch — including **trailing spaces** in column names — the node throws:

```
Column names were updated after the node's setup
```

This error is extremely persistent because:
1. The MCP API cannot force a schema refresh — it's a UI-only action
2. Even after manually refreshing in the UI, the cached schema can retain stale entries (e.g., `caller_name ` with trailing space)
3. Google Sheets silently adds trailing spaces when headers are pasted or auto-filled

## Solution: Replace Google Sheets Node with HTTP Request Node

Instead of using the Google Sheets node, use an **HTTP Request node** that calls the Google Sheets API directly. This completely bypasses schema validation.

### Step-by-step

1. **Remove** the existing Google Sheets node from the workflow

2. **Add an HTTP Request node** with these settings:
   - **Method**: `POST`
   - **URL**: `https://sheets.googleapis.com/v4/spreadsheets/{SPREADSHEET_ID}/values/{SHEET_NAME}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
   - **Authentication**: `Predefined Credential Type` → `Google Sheets OAuth2 API`
   - **Credential**: Select your existing Google Sheets OAuth2 credential
   - **Send Body**: `true`
   - **Content Type**: `JSON`
   - **Specify Body**: `JSON`
   - **JSON Body** (expression):
     ```
     ={{ JSON.stringify({ values: [[ $json.col_a, $json.col_b, $json.col_c, ... ]] }) }}
     ```

3. **Important**: The values array must be in the **exact column order** matching your sheet (A, B, C, D, ...). The API appends data positionally, not by column name.

4. **Connect** the HTTP Request node in place of the old Google Sheets node

5. **Test** — the HTTP Request node will return a response like:
   ```json
   {
     "spreadsheetId": "...",
     "updates": {
       "updatedRange": "Sheet1!A7:O7",
       "updatedRows": 1,
       "updatedColumns": 15,
       "updatedCells": 15
     }
   }
   ```

### Example for IETI Call Log

- **Spreadsheet ID**: `1i3EAobyU6L96TNcmJR9FglCqUuo-ypatkRj2CrxoY18`
- **Sheet**: `Sheet1`
- **Column order**: received_at, call_id, caller_name, caller_phone, concern_type, property_address, call_type, urgency_flag, after_hours, intake_collected, call_duration_seconds, call_status, user_sentiment, call_summary, description

**JSON Body expression**:
```
={{ JSON.stringify({ values: [[ $json.received_at, $json.call_id, $json.caller_name, $json.caller_phone, $json.concern_type, $json.property_address, $json.call_type, $json.urgency_flag, String($json.after_hours), String($json.intake_collected), String($json.call_duration_seconds), $json.call_status, $json.user_sentiment, $json.call_summary, $json.description ]] }) }}
```

## Why This Works

- The Google Sheets REST API doesn't validate column names — it writes data by position
- No schema cache to go stale
- No "Column names were updated" error
- Works regardless of trailing spaces or typos in headers
- Uses the same OAuth2 credential as the Google Sheets node

## When to Use This

- When the Google Sheets node repeatedly throws schema mismatch errors
- When column headers have been modified outside of n8n
- When you need reliable, cache-free writes to Google Sheets
- When the "refresh columns" button in n8n UI doesn't resolve the issue
