/**
 * Example Webhook Workflows
 * Các ví dụ workflow sử dụng webhook node
 */

export const webhookExamples = {
  // 1. Simple webhook receiver
  simpleWebhook: {
    name: "Simple Webhook Receiver",
    description: "Nhận webhook và log data",
    nodes: [
      {
        id: "webhook-1",
        type: "webhook",
        position: { x: 100, y: 100 },
        data: {
          label: "Webhook Trigger",
          config: {
            path: "simple-webhook",
            method: ["POST"],
            authType: "none",
            responseCode: 200,
            responseMode: "custom",
            responseData: JSON.stringify({ message: "Received!" }),
          },
        },
      },
      {
        id: "python-1",
        type: "python",
        position: { x: 400, y: 100 },
        data: {
          label: "Process Data",
          code: `
# Process webhook data
webhook_data = input_data

print("Received webhook:")
print(f"Method: {webhook_data['method']}")
print(f"Body: {webhook_data['body']}")

# Return processed data
output = {
    "processed": True,
    "timestamp": webhook_data['timestamp'],
    "data": webhook_data['body']
}
`,
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "webhook-1",
        target: "python-1",
      },
    ],
  },

  // 2. Authenticated webhook
  secureWebhook: {
    name: "Secure Webhook with Auth",
    description: "Webhook với header authentication",
    nodes: [
      {
        id: "webhook-1",
        type: "webhook",
        position: { x: 100, y: 100 },
        data: {
          label: "Secure Webhook",
          config: {
            path: "secure-webhook",
            method: ["POST", "PUT"],
            authType: "header",
            authValue: "your-secret-token-here",
            responseCode: 200,
            responseMode: "lastNode",
          },
        },
      },
      {
        id: "python-1",
        type: "python",
        position: { x: 400, y: 100 },
        data: {
          label: "Validate & Process",
          code: `
# Validate webhook data
data = input_data['body']

# Check required fields
required_fields = ['email', 'name']
missing = [f for f in required_fields if f not in data]

if missing:
    output = {
        "error": f"Missing fields: {missing}",
        "valid": False
    }
else:
    output = {
        "message": "Data validated successfully",
        "valid": True,
        "user": {
            "email": data['email'],
            "name": data['name']
        }
    }
`,
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "webhook-1",
        target: "python-1",
      },
    ],
  },

  // 3. Form submission handler
  formHandler: {
    name: "Form Submission Handler",
    description: "Xử lý form submission từ website",
    nodes: [
      {
        id: "webhook-1",
        type: "webhook",
        position: { x: 100, y: 100 },
        data: {
          label: "Form Webhook",
          config: {
            path: "form-submit",
            method: ["POST"],
            authType: "none",
            responseCode: 201,
            responseMode: "custom",
            responseData: JSON.stringify({
              success: true,
              message: "Form submitted successfully",
            }),
          },
        },
      },
      {
        id: "python-1",
        type: "python",
        position: { x: 400, y: 50 },
        data: {
          label: "Validate Form",
          code: `
import re

form_data = input_data['body']

# Validate email
email = form_data.get('email', '')
email_valid = re.match(r'^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$', email) is not None

# Validate required fields
errors = []
if not form_data.get('name'):
    errors.append('Name is required')
if not email_valid:
    errors.append('Invalid email')
if not form_data.get('message'):
    errors.append('Message is required')

output = {
    "valid": len(errors) == 0,
    "errors": errors,
    "data": form_data
}
`,
        },
      },
      {
        id: "python-2",
        type: "python",
        position: { x: 700, y: 50 },
        data: {
          label: "Save to Database",
          code: `
# Simulate saving to database
validation = input_data

if validation['valid']:
    # Save logic here
    output = {
        "saved": True,
        "id": "form-001",
        "timestamp": validation['data'].get('timestamp')
    }
else:
    output = {
        "saved": False,
        "errors": validation['errors']
    }
`,
        },
      },
      {
        id: "http-1",
        type: "http",
        position: { x: 1000, y: 50 },
        data: {
          label: "Send Email Notification",
          config: {
            method: "POST",
            url: "https://api.sendgrid.com/v3/mail/send",
            headers: [
              { key: "Authorization", value: "Bearer YOUR_API_KEY" },
              { key: "Content-Type", value: "application/json" },
            ],
          },
        },
      },
    ],
    edges: [
      { id: "e1", source: "webhook-1", target: "python-1" },
      { id: "e2", source: "python-1", target: "python-2" },
      { id: "e3", source: "python-2", target: "http-1" },
    ],
  },

  // 4. GitHub webhook integration
  githubWebhook: {
    name: "GitHub Push Webhook",
    description: "Xử lý GitHub push events",
    nodes: [
      {
        id: "webhook-1",
        type: "webhook",
        position: { x: 100, y: 100 },
        data: {
          label: "GitHub Webhook",
          config: {
            path: "github-push",
            method: ["POST"],
            authType: "header",
            authValue: "github-webhook-secret",
            responseCode: 200,
            responseMode: "custom",
            responseData: JSON.stringify({ received: true }),
          },
        },
      },
      {
        id: "python-1",
        type: "python",
        position: { x: 400, y: 100 },
        data: {
          label: "Parse GitHub Event",
          code: `
github_data = input_data['body']

# Extract relevant information
output = {
    "event": "push",
    "repository": github_data.get('repository', {}).get('full_name'),
    "branch": github_data.get('ref', '').split('/')[-1],
    "commits": len(github_data.get('commits', [])),
    "pusher": github_data.get('pusher', {}).get('name'),
    "timestamp": github_data.get('head_commit', {}).get('timestamp')
}

print(f"Push to {output['repository']} on {output['branch']}")
print(f"{output['commits']} commits by {output['pusher']}")
`,
        },
      },
      {
        id: "http-1",
        type: "http",
        position: { x: 700, y: 100 },
        data: {
          label: "Notify Slack",
          config: {
            method: "POST",
            url: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
            headers: [{ key: "Content-Type", value: "application/json" }],
          },
        },
      },
    ],
    edges: [
      { id: "e1", source: "webhook-1", target: "python-1" },
      { id: "e2", source: "python-1", target: "http-1" },
    ],
  },

  // 5. IoT sensor data collector
  iotCollector: {
    name: "IoT Sensor Data Collector",
    description: "Thu thập data từ IoT sensors",
    nodes: [
      {
        id: "webhook-1",
        type: "webhook",
        position: { x: 100, y: 100 },
        data: {
          label: "IoT Webhook",
          config: {
            path: "iot-sensor",
            method: ["POST", "PUT"],
            authType: "header",
            authValue: "iot-device-token",
            responseCode: 202,
            responseMode: "custom",
            responseData: JSON.stringify({ status: "accepted" }),
          },
        },
      },
      {
        id: "python-1",
        type: "python",
        position: { x: 400, y: 50 },
        data: {
          label: "Parse Sensor Data",
          code: `
sensor_data = input_data['body']

# Extract sensor readings
output = {
    "device_id": sensor_data.get('deviceId'),
    "temperature": float(sensor_data.get('temperature', 0)),
    "humidity": float(sensor_data.get('humidity', 0)),
    "timestamp": sensor_data.get('timestamp'),
    "location": sensor_data.get('location', 'unknown')
}

# Add alerts
if output['temperature'] > 30:
    output['alert'] = 'High temperature detected'
elif output['temperature'] < 10:
    output['alert'] = 'Low temperature detected'
`,
        },
      },
      {
        id: "python-2",
        type: "python",
        position: { x: 700, y: 50 },
        data: {
          label: "Store in Time Series DB",
          code: `
data = input_data

# Simulate storing in InfluxDB or similar
output = {
    "stored": True,
    "database": "sensor_readings",
    "measurement": "temperature_humidity",
    "tags": {
        "device_id": data['device_id'],
        "location": data['location']
    },
    "fields": {
        "temperature": data['temperature'],
        "humidity": data['humidity']
    },
    "timestamp": data['timestamp']
}

if 'alert' in data:
    output['alert_sent'] = True
`,
        },
      },
    ],
    edges: [
      { id: "e1", source: "webhook-1", target: "python-1" },
      { id: "e2", source: "python-1", target: "python-2" },
    ],
  },

  // 6. Multi-method webhook
  multiMethodWebhook: {
    name: "Multi-Method REST API",
    description: "REST API với nhiều HTTP methods",
    nodes: [
      {
        id: "webhook-1",
        type: "webhook",
        position: { x: 100, y: 100 },
        data: {
          label: "REST API Webhook",
          config: {
            path: "api/users",
            method: ["GET", "POST", "PUT", "DELETE"],
            authType: "header",
            authValue: "api-key-12345",
            responseCode: 200,
            responseMode: "lastNode",
          },
        },
      },
      {
        id: "python-1",
        type: "python",
        position: { x: 400, y: 100 },
        data: {
          label: "Handle Request",
          code: `
method = input_data['method']
body = input_data.get('body', {})
query = input_data.get('query', {})

if method == 'GET':
    # List or get user
    user_id = query.get('id')
    output = {
        "action": "list" if not user_id else "get",
        "user_id": user_id
    }
    
elif method == 'POST':
    # Create user
    output = {
        "action": "create",
        "user": body,
        "created_id": "user-001"
    }
    
elif method == 'PUT':
    # Update user
    output = {
        "action": "update",
        "user_id": body.get('id'),
        "updates": body
    }
    
elif method == 'DELETE':
    # Delete user
    output = {
        "action": "delete",
        "user_id": body.get('id'),
        "deleted": True
    }
`,
        },
      },
    ],
    edges: [{ id: "e1", source: "webhook-1", target: "python-1" }],
  },
};

/**
 * Load example workflow into canvas
 */
export function loadWebhookExample(exampleKey: keyof typeof webhookExamples) {
  return webhookExamples[exampleKey];
}
