const fs = require('fs');
const path = require('path');

// File to store messages (in Netlify's temporary storage)
const MESSAGES_FILE = path.join('/tmp', 'messages.json');

// Initialize with default messages if file doesn't exist
function initializeMessages() {
    if (!fs.existsSync(MESSAGES_FILE)) {
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
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(defaultMessages, null, 2));
    }
}

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        initializeMessages();
        
        if (event.httpMethod === 'GET') {
            // Return all messages
            const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(messages)
            };
        } else if (event.httpMethod === 'POST') {
            // Add new message
            const newMessage = JSON.parse(event.body);
            const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
            messages.unshift(newMessage);
            fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }
        
        return { statusCode: 405, headers, body: 'Method not allowed' };
    } catch (error) {
        console.error('Function error:', error);
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: error.message }) 
        };
    }
};