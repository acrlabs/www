# Contact us

Have a question?  Need help with your Kubernetes install?  Want to schedule something?  Let us know!

<form id="contactform" method="post">
  <div id="result"></div>
  <div class="formelement">
    <label for="name">Your name:</label>
    <input type="text" id="name" name="name">
  </div>
  <div class="formelement">
    <label for="email">Your email:</label>
    <input type="email" id="email" name="email">
  </div>
  <div class="formelement">
    <label for="message">How can we help you?</label>
    <textarea id="message" cols="40" rows="10" name="message"></textarea>
  </div>
  <label class="vegetable">
    What is your favorite vegetable?
    <textarea name="vegetable"></textarea>
  </label>
  <div class="h-captcha formelement" data-sitekey="13f25422-b1d6-450a-8b6f-9238c7535ee9"></div>
  <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
  <button type="submit">Submit</button>
</form>

<script type="text/javascript" async defer>
   $(document).ready(function(){
    $("#contactform").submit(function(ev){
        ev.preventDefault();

        $.ajax({
          type: "post",
          url: "/send.php",
          data: $('#contactform').serialize(),
          dataType: "json",
          success: function(response) {
            if(response.success) {
              $('#result').html("<h2>Message successfully sent.</h2>").hide().fadeIn(1500);
            } else {
              $('#result').html("<h2>Error sending the message: " + response.message + "</h2>").hide().fadeIn(1500);
            }
          },
          error: function(xhr, ajaxOptions, thrownError) {
              $('#result').html("<h2>Error sending the message</h2>").hide().fadeIn(1500);
          }
        });
    });
    });
</script>
