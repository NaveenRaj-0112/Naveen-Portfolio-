<?php
/**
 * Contact Form Configuration
 * 
 * SMTP credentials and email settings.
 * KEEP THIS FILE SECURE - do not expose to the public web.
 * 
 * Update the values below with your actual SMTP credentials.
 */

return [
    // Destination email - where messages will be sent
    'mail_to' => 'naveenrajkrishnan2003@gmail.com',
    
    // SMTP Configuration
    'smtp' => [
        'host'       => 'smtp.gmail.com',        // Gmail SMTP host
        'port'       => 587,                      // TLS port (587) or SSL port (465)
        'encryption' => 'tls',                    // 'tls' or 'ssl'
        'username'   => 'naveenrajkrishnan2003@gmail.com',  // Your Gmail address
        'password'   => 'YOUR_APP_PASSWORD_HERE',           // Gmail App Password (NOT your regular password)
    ],
    
    // From address (your authenticated SMTP email)
    'mail_from' => 'naveenrajkrishnan2003@gmail.com',
    'mail_from_name' => 'Naveen Raj K - Portfolio',
    
    // Rate limiting (optional)
    'rate_limit' => 5,           // Max submissions per IP per hour
    'rate_limit_file' => __DIR__ . '/rate_limit.json',
];
