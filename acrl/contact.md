---
template: form.html
---

# Contact us

Have a question?  Need help with your Kubernetes install?  Want to schedule something?  Let us know!

<form id="contactform" method="post">
  <div id="result"></div>
  <input type="text" id="name" name="name" placeholder="Name*">
  <input type="email" id="email" name="email" placeholder="Email*">
  <input type="text" id="company" name="company" placeholder="Company">
  <textarea id="message" cols="40" rows="10" name="message" placeholder="How can we help you?"></textarea>
  <textarea id="vegetable" name="vegetable" placeholder="What is your favorite vegetable?"></textarea>
  <button type="submit" name="submitform">Submit</button>
</form>

<script type="text/javascript" defer>$(document).ready(handle_submit_form); </script>
