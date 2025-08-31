exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the form data
    const formData = new URLSearchParams(event.body);
    const name = formData.get('name');
    const message = formData.get('message');
    
    // Validate the input
    if (!name || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and message are required' })
      };
    }
    
    // Create a new message object
    const newMessage = {
      author: name,
      date: new Date().toLocaleDateString(),
      content: message,
      id: Date.now().toString() // Simple ID for the message
    };
    
    // In a real implementation, you would save this to a database
    // For this example, we'll just return success
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Message submitted successfully',
        data: newMessage 
      })
    };
  } catch (error) {
    console.error('Error processing form submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};