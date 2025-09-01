const https = require('https');

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
    // If we have environment variables set up, try to fetch from Netlify API
    if (process.env.NETLIFY_AUTH_TOKEN && process.env.SITE_ID) {
      const options = {
        hostname: 'api.netlify.com',
        port: 443,
        path: `/api/v1/sites/${process.env.SITE_ID}/forms/birthday-messages/submissions`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };

      const data = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                resolve(JSON.parse(body));
              } else {
                // If we get an error, return default messages
                resolve(defaultMessages);
              }
            } catch (e) {
              resolve(defaultMessages);
            }
          });
        });
        
        req.on('error', () => {
          // If there's a network error, return default messages
          resolve(defaultMessages);
        });
        
        req.end();
      });

      // Transform the submissions to match your expected format
      if (Array.isArray(data) && data.length > 0) {
        const messages = data.map(submission => ({
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
      }
    }

    // If we don't have environment variables or if there was an error, return default messages
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
    // Always return default messages on error
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(defaultMessages)
    };
  }
};