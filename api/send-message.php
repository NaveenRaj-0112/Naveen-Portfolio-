<?php
/**
 * Contact Form Handler
 * 
 * Receives form submissions and sends email via PHPMailer/SMTP.
 * All SMTP credentials are stored in config.php (not exposed to frontend).
 */

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Set JSON response header
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Load configuration
$config = require __DIR__ . '/config.php';

// Load Composer autoloader (for PHPMailer)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    echo json_encode(['success' => false, 'message' => 'Server configuration error.']);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ==========================================
// RATE LIMITING
// ==========================================
function checkRateLimit($config) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = $config['rate_limit_file'];
    $limit = $config['rate_limit'];
    
    $data = [];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: [];
    }
    
    $hour = date('Y-m-d-H');
    $key = $ip . '_' . $hour;
    
    if (isset($data[$key]) && $data[$key] >= $limit) {
        return false;
    }
    
    $data[$key] = ($data[$key] ?? 0) + 1;
    
    // Clean old entries (older than 2 hours)
    $cleaned = [];
    foreach ($data as $k => $v) {
        $parts = explode('_', $k);
        $entryHour = end($parts);
        if ($entryHour >= date('Y-m-d-H', strtotime('-2 hours'))) {
            $cleaned[$k] = $v;
        }
    }
    
    file_put_contents($file, json_encode($cleaned));
    return true;
}

// ==========================================
// INPUT SANITIZATION
// ==========================================
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    $data = strip_tags($data);
    return $data;
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// ==========================================
// CHECK RATE LIMIT
// ==========================================
if (!checkRateLimit($config)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
    exit;
}

// ==========================================
// GET AND VALIDATE INPUT
// ==========================================
$name    = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
$email   = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : '';
$message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';

// Server-side validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required.';
} elseif (strlen($name) > 100) {
    $errors[] = 'Name is too long.';
}

if (empty($email)) {
    $errors[] = 'Email is required.';
} elseif (!isValidEmail($email)) {
    $errors[] = 'Invalid email address.';
} elseif (strlen($email) > 254) {
    $errors[] = 'Email is too long.';
}

if (empty($subject)) {
    $errors[] = 'Subject is required.';
} elseif (strlen($subject) > 200) {
    $errors[] = 'Subject is too long.';
}

if (empty($message)) {
    $errors[] = 'Message is required.';
} elseif (strlen($message) > 5000) {
    $errors[] = 'Message is too long (max 5000 characters).';
}

// Check for spam patterns
$spamPatterns = ['<script', 'javascript:', 'onclick', 'onerror', 'onload', '<iframe', '<object', '<embed'];
$allFields = strtolower($name . ' ' . $email . ' ' . ' ' . $message);
foreach ($spamPatterns as $pattern) {
    if (strpos($allFields, $pattern) !== false) {
        $errors[] = 'Invalid content detected.';
        break;
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ==========================================
// SEND EMAIL VIA PHPMAILER
// ==========================================
try {
    $mail = new PHPMailer(true);
    
    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = $config['smtp']['host'];
    $mail->Port       = $config['smtp']['port'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['smtp']['username'];
    $mail->Password   = $config['smtp']['password'];
    $mail->SMTPSecure = $config['smtp']['encryption'];
    $mail->CharSet    = 'UTF-8';
    
    // Recipients
    $mail->setFrom($config['mail_from'], $config['mail_from_name']);
    $mail->addAddress($config['mail_to']);
    
    // Reply-To: visitor's email (so clicking Reply goes to them)
    $mail->addReplyTo($email, $name);
    
    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Portfolio Contact: ' . $subject;
    
    // HTML email body
    $htmlBody = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6c63ff, #4ecdc4); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h2 { margin: 0; font-size: 20px; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #6c63ff; }
            .footer { text-align: center; padding: 15px; font-size: 12px; color: #888; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Message from Portfolio</h2>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Visitor Name</div>
                    <div class="value">' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</div>
                </div>
                <div class="field">
                    <div class="label">Visitor Email</div>
                    <div class="value">' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</div>
                </div>
                <div class="field">
                    <div class="label">Subject</div>
                    <div class="value">' . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . '</div>
                </div>
                <div class="field">
                    <div class="label">Message</div>
                    <div class="value">' . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . '</div>
                </div>
            </div>
            <div class="footer">
                Sent from Naveen Raj K Portfolio Contact Form
            </div>
        </div>
    </body>
    </html>';
    
    // Plain text version
    $textBody = "New Message from Portfolio\n\n";
    $textBody .= "Visitor Name: " . $name . "\n";
    $textBody .= "Visitor Email: " . $email . "\n";
    $textBody .= "Subject: " . $subject . "\n";
    $textBody .= "Message:\n" . $message . "\n\n";
    $textBody .= "---\nSent from Naveen Raj K Portfolio Contact Form";
    
    $mail->Body = $htmlBody;
    $mail->AltBody = $textBody;
    
    $mail->send();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Message sent successfully! Thank you for contacting me.'
    ]);
    
} catch (Exception $e) {
    // Log error securely (don't expose to user)
    error_log('Contact Form Error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Unable to send your message. Please try again later.'
    ]);
}
