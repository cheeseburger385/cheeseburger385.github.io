<?php
/**
 * AMM Taxi Frankfurt - Taxi Bestellung Verarbeitung
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
$pickup = isset($_POST['pickup']) ? sanitize_input($_POST['pickup']) : '';
$destination = isset($_POST['destination']) ? sanitize_input($_POST['destination']) : '';
$datetime = isset($_POST['datetime']) ? sanitize_input($_POST['datetime']) : '';
$passengers = isset($_POST['passengers']) ? intval($_POST['passengers']) : 1;
$phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
$wheelchair = isset($_POST['wheelchair']) ? true : false;
$childseat = isset($_POST['childseat']) ? true : false;
$companion = isset($_POST['companion']) ? true : false;

// Validation
$errors = [];

if (empty($pickup)) {
    $errors[] = 'Bitte geben Sie eine Abholadresse ein.';
}

if (empty($destination)) {
    $errors[] = 'Bitte geben Sie eine Zieladresse ein.';
}

if (empty($phone)) {
    $errors[] = 'Bitte geben Sie Ihre Telefonnummer ein.';
}

// If there are errors, redirect back
if (!empty($errors)) {
    $error_message = urlencode(implode(' ', $errors));
    header('Location: index.php?order_error=' . $error_message . '#order');
    exit;
}

// Format datetime
$datetime_text = format_datetime($datetime);

// Build email content
$subject = 'Neue Taxi-Bestellung - ' . $company_name;

$message = "Neue Taxi-Bestellung über die Website:\n\n";
$message .= "Abholadresse: " . $pickup . "\n";
$message .= "Zieladresse: " . $destination . "\n";
$message .= "Wann: " . $datetime_text . "\n";
$message .= "Anzahl Personen: " . $passengers . "\n";
$message .= "Telefon: " . $phone . "\n\n";

$message .= "Besondere Anforderungen:\n";
$message .= "Rollstuhlgerecht: " . ($wheelchair ? 'Ja' : 'Nein') . "\n";
$message .= "Kindersitz: " . ($childseat ? 'Ja' : 'Nein') . "\n";
$message .= "Begleitung nötig: " . ($companion ? 'Ja' : 'Nein') . "\n\n";

$message .= "Bestellzeit: " . date('d.m.Y H:i:s') . "\n";
$message .= "IP-Adresse: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Headers
$headers = 'From: ' . $company_name . ' <noreply@amm-taxi.de>' . "\r\n";
$headers .= 'Reply-To: ' . $phone . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion();

// Send email
$mail_sent = mail($recipient_email, $subject, $message, $headers);

// Redirect based on result
if ($mail_sent) {
    header('Location: index.php?order_success=1#order');
} else {
    header('Location: index.php?order_error=' . urlencode('Es ist ein Fehler aufgetreten. Bitte rufen Sie uns direkt an.') . '#order');
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
 * Format datetime value
 */
function format_datetime($value) {
    switch ($value) {
        case 'now':
            return 'Sofort';
        case '15min':
            return 'In 15 Minuten';
        case '30min':
            return 'In 30 Minuten';
        case '1h':
            return 'In 1 Stunde';
        case 'custom':
            return 'Anderes Datum (bitte anrufen)';
        default:
            return 'Sofort';
    }
}
