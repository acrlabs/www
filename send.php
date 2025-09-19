<?php

require_once '/usr/share/php/aws/aws-autoloader.php';

use Aws\Ses\SesClient;
use Aws\Exception\AwsException;

$msg = 'Thank you for your message!  We\'ll respond soon!';
$success = true;

if (array_key_exists('email', $_POST)) {
    if ($_POST['vegetable'] != "") {
        $msg = "Sorry, you look like a bot.  Please don't try again";
        $success = false;
    } else {
        $name = $_POST['name'];
        $sender = $_POST['email'];
        $topic = $_POST['topic'];
        $message = $_POST['message'];

        $sesClient = new SesClient([
            'version' => 'latest',
            'region'  => 'us-east-1',
            'credentials' => [
                'key'    => $_SERVER['AWS_ACCESS_KEY_ID'],
                'secret' => $_SERVER['AWS_SECRET_ACCESS_KEY'],
            ]
        ]);

        $subject = "ACRL Contact Form Submission";
        $bodyText = "New contact request received!\n\nName: $name\nEmail: $sender\nTopic: $topic\nMessage: $message";

        $emailParams = [
            'Destination' => [
                'ToAddresses' => ['drmorr@appliedcomputing.io'],
            ],
            'Message' => [
                'Body' => [
                    'Text' => [
                        'Charset' => 'UTF-8',
                        'Data' => $bodyText,
                    ],
                ],
                'Subject' => [
                    'Charset' => 'UTF-8',
                    'Data' => $subject,
                ],
            ],
            'Source' => 'contact@appliedcomputing.io',
            'ReplyToAddresses' => [$sender],
        ];

        try {
            $result = $sesClient->sendEmail($emailParams);
            if (!isset($result['MessageId'])) {
                $msg = "Could not send email - no message ID returned";
                $success = false;
            }
        } catch (AwsException $e) {
            $msg = "AWS SES error: " . $e->getAwsErrorMessage();
            $success = false;
        } catch (Exception $e) {
            $msg = "Some other exception: " . $e->getMessage();
            $success = false;
        }
    }
}

$response = ['message' => $msg, 'success' => $success];
header('Content-type: application/json');
echo json_encode($response);

?>
