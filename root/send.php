<?php

require("/usr/share/php/sendgrid/sendgrid-php.php");


function check_captcha($response) {
	$fields = [
		'response' => $_POST['h-captcha-response'],
		'secret'   => $_SERVER['H_CAPTCHA_SECRET'],
	];
	$fields_str = http_build_query($fields);
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, 'https://hcaptcha.com/siteverify');
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_str);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$result = curl_exec($ch);
	curl_close($ch);
	
	$data = json_decode($result);
	return $data->success;
}

$msg = '';
$success = true;
if (array_key_exists('email', $_POST)) {
	if (!$_POST['h-captcha-response']) {
        $msg = "Please complete the CAPTCHA";
        $success = false;
	} else if ($_POST['vegetable'] != "" || !check_captcha($_POST['h-captcha-response'])) {
        $msg = "Sorry, you look like a bot.  Please don't try again";
        $success = false;
	} else {
		$name = $_POST['name'];
		$sender = $_POST['email'];
		$message = $_POST['message'];


		$email = new \SendGrid\Mail\Mail();
		$email->setFrom("contact@appliedcomputing.io", "Contact Form");
		$email->setSubject("ACRL Contact Form Submission");
		$email->setReplyTo($sender);
		$email->addTo("drmorr@appliedcomputing.io");
		$email->addContent("text/plain", "New contact request received!\nName: $name\nEmail: $sender\nMessage: $message");
		$sendgrid = new \SendGrid($_SERVER['SENDGRID_API_KEY']);
		try {
			$response = $sendgrid->send($email);
			if ($response->statusCode() >= 400) {
                $msg = 'Sorry, something went wrong.  Please try again later.';
                $success = false;
			}
		} catch (Exception $e) {
            $msg = 'Sorry, something went wrong.  Please try again later.';
            $success = false;
		}

        $msg = 'Thank you for your message!  We\'ll respond soon!';
	}
}

$response = [ 'message' => $msg, 'success' => $success ];
header('Content-type: application/json');
echo json_encode($response);

?>
