<?php
/**
 * AMM Taxi Frankfurt - Kontaktformular Verarbeitung
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Configuration
$recipient_email = 'info@amm-taxi.de';
$company_name = 'AMM Taxi Frankfurt';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    exit('Method not allowed');
}

// Get and sanitize form data
$name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
$subject = isset($_POST['subject']) ? sanitize_input($_POST['subject']) : '';
$message_text = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';

// Validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Bitte geben Sie Ihren Namen ein.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
}

if (empty($message_text)) {
    $errors[] = 'Bitte geben Sie eine Nachricht ein.';
}

// If there are errors, redirect back
if (!empty($errors)) {
    $error_message = urlencode(implode(' ', $errors));
    header('Location: index.php?contact_error=' . $error_message . '#contact');
    exit;
}

// Format subject
$subject_text = format_subject($subject);

// Build email content
$email_subject = 'Kontaktanfrage: ' . $subject_text . ' - ' . $company_name;

$message = "Neue Kontaktanfrage über die Website:\n\n";
$message .= "Name: " . $name . "\n";
$message .= "E-Mail: " . $email . "\n";
$message .= "Telefon: " . ($phone ? $phone : 'Nicht angegeben') . "\n";
$message .= "Betreff: " . $subject_text . "\n\n";
$message .= "Nachricht:\n";
$message .= $message_text . "\n\n";
$message .= "------------------------------\n";
$message .= "Gesendet am: " . date('d.m.Y H:i:s') . "\n";
$message .= "IP-Adresse: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Headers
$headers = 'From: ' . $name . ' <' . $email . '>' . "\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion();

// Send email
$mail_sent = mail($recipient_email, $email_subject, $message, $headers);

// Redirect based on result
if ($mail_sent) {
    header('Location: index.php?contact_success=1#contact');
} else {
    header('Location: index.php?contact_error=' . urlencode('Es ist ein Fehler aufgetreten. Bitte rufen Sie uns direkt an.') . '#contact');
}
exit;

/**
 * Sanitize input data
 */
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Format subject value
 */
function format_subject($value) {
    $subjects = [
        'booking' => 'Fahrt buchen',
        'medical' => 'Krankenfahrt',
        'school' => 'Schultransport',
        'business' => 'Business',
        'other' => 'Sonstiges'
    ];
    
    return isset($subjects[$value]) ? $subjects[$value] : 'Allgemeine Anfrage';
}
