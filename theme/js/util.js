function handle_hamburger() {
    $("#hamburger").click(function() {
        console.log("foo");
        $("aside").animate({"left": "0"}, "fast");
    });
}

function handle_sidebar_close() {
    $("#sidebar-close").click(function() {
        var bodyStyles = window.getComputedStyle(document.body);
        var width = bodyStyles.getPropertyValue("--sidebar-width-mobile");
        $("aside").animate({"left": "-200"}, "fast");
    });
}

function handle_submit_form() {
    $("#contactform").submit(function(ev) {
        ev.preventDefault();

        $.ajax({
          type: "post",
          url: "/send.php",
          data: $('#contactform').serialize(),
          dataType: "json",
          success: function(response) {
            if(response.success) {
              $('#result').html("<span class='success'>Message successfully sent.  We'll be in touch soon!</span>").hide().fadeIn(1500);
              $('button[name=submitform]').attr("disabled", true);
            } else {
              $('#result').html("<span class='error'>Error sending the message: " + response.message + "</span>").hide().fadeIn(1500);
            }
          },
          error: function(xhr, ajaxOptions, thrownError) {
              $('#result').html("<span class='error'>Unknown error sending the message" + "</span>").hide().fadeIn(1500);
          }
        });
    });
}
