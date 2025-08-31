exports.handler = async (event, context) => {
  // Only GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // In a real implementation, you would fetch from Netlify's API
    // For this example, we'll return mock data
    const messages = [
      {
        author: "Grandma",
        date: "Today",
        content: "Happy first birthday to our precious grandchildren! Watching you both grow this year has been the greatest joy! We love you more than words can say!"
      },
      {
        author: "Aunt Sarah",
        date: "Today",
        content: "Happy birthday to the two most adorable twins! Armani and Ameerah, you bring so much happiness to our family. Can't wait to celebrate with you!"
      }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(messages)
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};