
function switchTheme() {
    var theme = 'default';
    if (document.documentElement.getAttribute('data-theme') == 'default') {
        theme = 'alternate';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('acrl-theme', theme);
}

const currentTheme = localStorage.getItem('acrl-theme') ? localStorage.getItem('acrl-theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

const openContentClass = 'open';

function toggleSidebarItem(item_id) {
    var sidebar = document.getElementById('sidebar');
    var subMenu = document.getElementById(item_id).nextElementSibling;
    if (subMenu.classList.contains(openContentClass)) {
        subMenu.style.maxHeight = null;
        subMenu.classList.remove(openContentClass);
    } else {
        var otherOpenMenus = sidebar.getElementsByClassName(openContentClass);
        for (var i = 0; i < otherOpenMenus.length; i++) {
            // Need to set display: none first, because getElementsByClassName is a live
            // method, so as soon as we remove the class name, the list is invalid
            //
            // This _could_ cause problems if we ever get into a state where there is
            // more than one open menu, but by design that's not the case here.
            otherOpenMenus[i].style.maxHeight = null;
            otherOpenMenus[i].classList.remove(openContentClass);
        }

        subMenu.classList.add(openContentClass);
        subMenu.style.maxHeight = subMenu.scrollHeight + 'px';
    }
}

function toggleDropdown(toggle_id) {
    var dropdown = document.querySelector(toggle_id);
    if (dropdown.classList.contains(openContentClass)) {
        dropdown.style.maxHeight = null;
        setTimeout(function() { dropdown.classList.remove(openContentClass); }, 197);
    } else {
        console.log('ding');
        dropdown.classList.add(openContentClass);
        dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
    }
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
