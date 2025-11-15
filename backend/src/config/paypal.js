require('dotenv').config();

const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com"

async function generateAccessToken() {
    const {
        PAYPAL_CLIENT_ID = "AfhFIQjZoE-XLutk3Jc5APIHo8AYhm-mxlYnqiwNug6kq9QS5PuiAxoxVHeyTEc-SEUMlHizINa3nswJ",
        PAYPAL_APP_SECRET = "ECM6zHYT4uN1UgRHE1N9QzjYwYxAnw81CkHB2ml53m7HfYnr0cynZD53I5FDnswXMjiJ0ogo07Eeqg7r"
    } = process.env
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString('base64')

    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": 'application/x-www-form-urlencoded'
        }
    })

    const jsonData = await handleResponse(response)
    return jsonData.access_token
}

async function handleResponse(response) {
    if (response.ok) {
        return response.json()
    }
    else {
        const errorMessage = await response.text()
        throw new Error(errorMessage)
    }
}

const paypal = {
    createOrder: async function createOrder(price) {
        const accessToken = await generateAccessToken()
        const url = `${base}/v2/checkout/orders`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: price
                        }
                    }
                ]
            })
        })

        return handleResponse(response)
    },
    capturePayment: async function capturePayment(orderId) {
        const accessToken = await generateAccessToken()
        const url = `${base}/v2/checkout/orders/${orderId}/capture`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            },
        })

        return handleResponse(response)
    }
}

module.exports = {
    paypal,
    generateAccessToken
}