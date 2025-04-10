const generateUserId = () => {
    // Get current timestamp
    const timestamp = Date.now().toString();
    
    // Generate a random number between 1000 and 9999
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    
    // Combine timestamp and random number
    const userId = `USER${timestamp}${randomNum}`;
    
    return userId;
};

module.exports = { generateUserId }; 