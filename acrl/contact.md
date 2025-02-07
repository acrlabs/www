---
template: form.html
---

# Contact us

Have a question?  Need help with your Kubernetes install?  Want to schedule something?  Let us know!

<form id="contactform" method="post">
  <label for="name">Name (required):</label>
  <input type="text" id="name" name="name" placeholder="Name*" required>
  <label for="email">Email (required):</label>
  <input type="email" id="email" name="email" placeholder="Email*" required>
  <label for="company">Company:</label>
  <input type="text" id="company" name="company" placeholder="Company">
  <label for="topic">Topic (required):</label>
  <select name="topic" id="topic" required>
    <option disabled selected value="">Choose a topic...</option>
    <option>Simulation or SimKube</option>
    <option>Kubernetes modeling or data generation</option>
    <option>General Kubernetes support</option>
    <option>Just want to say hi!</option>
  </select>
  <label for="message">Message (required):</label>
  <textarea id="message" cols="40" rows="10" name="message" placeholder="How can we help you?*" required></textarea>
  <textarea aria-hidden="true" id="vegetable" name="vegetable" placeholder="What is your favorite vegetable?"></textarea>
  <button type="submit" name="submitform">Submit</button>
  <div id="result"></div>
</form>

<script type="text/javascript" defer>$(document).ready(handle_submit_form); </script>
