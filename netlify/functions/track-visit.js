const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    const filePath = path.join(__dirname, 'visited-ips.json');
    
    let visitedIPs = [];
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            visitedIPs = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading file:', error);
    }
    
    if (visitedIPs.includes(ip)) {
        return {
            statusCode: 302,
            headers: {
                'Location': '/expired.html'
            }
        };
    } else {
        visitedIPs.push(ip);
        try {
            fs.writeFileSync(filePath, JSON.stringify(visitedIPs));
        } catch (error) {
            console.error('Error writing file:', error);
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Visit tracked' })
        };
    }
};