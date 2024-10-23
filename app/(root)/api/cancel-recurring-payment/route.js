// Updated handler to send POST body correctly
export default async function handler(req, res) {
    const { recId, token } = req.query; // Get the recId and token from the query params

    // Ensure recId and token exist
    if (!recId || !token) {
        return res.status(400).json({ status: 'error', message: 'Missing recId or token' });
    }

    try {
        // Send a POST request to the WordPress backend
        const response = await fetch(
            `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/cancel-recurring-payment/`, // Send request without query params
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recId: recId, // Pass recId in the body
                    token: token, // Pass token in the body
                }),
            }
        );

        const data = await response.json();

        if (response.ok) {
            // Send success response back to the frontend
            res.status(200).json({ status: 'success', message: data.message });
        } else {
            // Send error response back to the frontend
            res.status(400).json({ status: 'error', message: data.message });
        }
    } catch (error) {
        // Handle network or other errors
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}
