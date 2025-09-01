const https = require('https');

exports.handler = async (event, context) => {
  console.log('Function started');
  console.log('Environment variables check:', {
    hasToken: !!process.env.NETLIFY_AUTH_TOKEN,
    hasSiteId: !!process.env.BIRTHDAY_SITE_ID,
    tokenLength: process.env.NETLIFY_AUTH_TOKEN ? process.env.NETLIFY_AUTH_TOKEN.length : 0,
    siteId: process.env.BIRTHDAY_SITE_ID
  });

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
    if (process.env.NETLIFY_AUTH_TOKEN && process.env.BIRTHDAY_SITE_ID) {
      console.log('Environment variables found, attempting to fetch from Netlify API');
      
      const options = {
        hostname: 'api.netlify.com',
        port: 443,
        path: `/api/v1/sites/${process.env.BIRTHDAY_SITE_ID}/forms/birthday-messages/submissions`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Birthday-Site-Function/1.0'
        }
      };

      const data = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            console.log('API Response status:', res.statusCode);
            console.log('API Response headers:', res.headers);
            
            try {
              if (res.statusCode === 200) {
                const parsed = JSON.parse(body);
                console.log('Successfully parsed response, type:', typeof parsed);
                console.log('Response content:', JSON.stringify(parsed, null, 2));
                resolve(parsed);
              } else {
                console.error('API returned non-200 status:', res.statusCode);
                console.error('API response:', body);
                // If we get an error, return default messages
                resolve(defaultMessages);
              }
            } catch (e) {
              console.error('Error parsing API response:', e);
              console.error('Response body:', body);
              resolve(defaultMessages);
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('API request error:', error);
          // If there's a network error, return default messages
          resolve(defaultMessages);
        });
        
        req.setTimeout(10000, () => {
          console.error('API request timed out');
          req.destroy();
          resolve(defaultMessages);
        });
        
        req.end();
      });

      // Check if we got valid data
      if (!Array.isArray(data)) {
        console.log('Data is not an array, returning default messages');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(defaultMessages)
        };
      }

      // Transform the submissions to match your expected format
      console.log('Processing', data.length, 'submissions');
      const messages = data
        .filter(submission => {
          // Filter out submissions that don't have the expected structure
          const isValid = submission && submission.data && submission.data.name && submission.data.message;
          if (!isValid) {
            console.log('Invalid submission structure:', JSON.stringify(submission, null, 2));
          }
          return isValid;
        })
        .map(submission => {
          // Safely extract the data
          return {
            author: submission.data.name || 'Anonymous',
            date: submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'Today',
            content: submission.data.message || 'No message content'
          };
        });

      console.log('Valid messages found:', messages.length);
      
      // If we have valid messages, return them
      if (messages.length > 0) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(messages)
        };
      } else {
        console.log('No valid messages found, returning default messages');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(defaultMessages)
        };
      }
    } else {
      console.log('Environment variables not found, returning default messages');
      console.log('Missing:', {
        token: !process.env.NETLIFY_AUTH_TOKEN,
        siteId: !process.env.BIRTHDAY_SITE_ID
      });
      // If we don't have environment variables, return default messages
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(defaultMessages)
      };
    }
  } catch (error) {
    console.error('Unexpected error in function:', error);
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