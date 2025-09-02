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
      
      // Try different API endpoints
      const apiEndpoints = [
        `/api/v1/sites/${process.env.BIRTHDAY_SITE_ID}/forms/birthday-messages/submissions`,
        `/api/v1/sites/${process.env.BIRTHDAY_SITE_ID}/submissions`,
        `/api/v1/submissions?site_id=${process.env.BIRTHDAY_SITE_ID}&form_name=birthday-messages`
      ];
      
      let data = [];
      let success = false;
      
      for (const endpoint of apiEndpoints) {
        console.log('Trying endpoint:', endpoint);
        
        const options = {
          hostname: 'api.netlify.com',
          port: 443,
          path: endpoint,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Birthday-Site-Function/1.0'
          }
        };

        try {
          data = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
              let body = '';
              res.on('data', (chunk) => body += chunk);
              res.on('end', () => {
                console.log('API Response status:', res.statusCode);
                
                try {
                  if (res.statusCode === 200) {
                    const parsed = JSON.parse(body);
                    console.log('Successfully parsed response, number of submissions:', Array.isArray(parsed) ? parsed.length : 'Not an array');
                    resolve(parsed);
                    success = true;
                  } else {
                    console.log('Endpoint returned status:', res.statusCode);
                    resolve([]);
                  }
                } catch (e) {
                  console.error('Error parsing API response:', e);
                  resolve([]);
                }
              });
            });
            
            req.on('error', (error) => {
              console.error('API request error:', error);
              resolve([]);
            });
            
            req.setTimeout(5000, () => {
              console.error('API request timed out');
              req.destroy();
              resolve([]);
            });
            
            req.end();
          });
          
          // If we got data, break out of the loop
          if (success) {
            break;
          }
        } catch (error) {
          console.error('Error with endpoint:', endpoint, error);
          continue;
        }
      }
      
      console.log('Processing', data.length, 'submissions');
      
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
      console.log('Messages:', JSON.stringify(messages, null, 2));
      
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