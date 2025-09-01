exports.handler = async (event, context) => {
  // Set up default messages
  const defaultMessages = [
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

  try {
    // In a real implementation, you would fetch from Netlify's API
    // For now, we'll return the default messages
    // This will be updated once you set up the environment variables
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(defaultMessages)
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