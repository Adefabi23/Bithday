exports.handler = async (event, context) => {
  try {
    // Get the form submissions from Netlify
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${process.env.SITE_ID}/forms/birthday-messages/submissions`, {
      headers: {
        'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const submissions = await response.json();
    
    // Transform the submissions to match your expected format
    const messages = submissions.map(submission => ({
      author: submission.data.name,
      date: new Date(submission.created_at).toLocaleDateString(),
      content: submission.data.message
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(messages)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};