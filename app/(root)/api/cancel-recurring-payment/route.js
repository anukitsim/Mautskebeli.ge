

export default async function handler(req, res) {
    const { recId, token } = req.query;
  
    // Send a POST request to the WordPress backend
    const response = await fetch(
      `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/cancel-recurring-payment/?recId=${recId}&token=${token}`,
      {
        method: 'POST',
      }
    );
  
    const data = await response.json();
  
    if (response.ok) {
      res.status(200).json({ status: 'success', message: data.message });
    } else {
      res.status(400).json({ status: 'error', message: data.message });
    }
  }
  