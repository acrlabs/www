---
template: base.html
---

<div class="hero flex twocols">
  <div class="left">
    <h1>Applied Computing Research Labs</h1>
    <ul>
      <li class="icon scale">Efficiency at Scale</li>
      <li class="icon expertise">Proven Expertise</li>
      <li class="icon solutions">Innovative Solutions</li>
      <li class="icon research">Open-Source Research</li>
    </ul>
    <div class="buttons">
      <a href="https://youtu.be/oaWxk5Vr2s0">View Demo</a>
      <a class="secondary" href="/contact/">Partner with Us</a>
    </div>
  </div>

  <div>
    <img id="hero1" src="/img/hero1.png">
    <img id="hero2" src="/img/hero2.png">
  </div>
</div>

<section>
  <h2>Open-source Research and Development in Distributed Systems</h2>

  <div class="flex twocols">
    <div class="subsection">
      <h3 class="scale icon">Efficiency at Scale</h3>
      <p>ACRL applies simulation analysis to your compute platform in order to eliminate bottlenecks, optimize costs, and
      improve resource utilization, all without risking production downtime.</p>
    </div>
    <div class="subsection">
      <h3 class="expertise icon">Proven Expertise</h3>
      <p>Our team brings unmatched expertise to your organization, with a decade of industry experience operating and
      managing large-scale distributed systems like Kubernetes.</p>
    </div>
    <div class="subsection">
      <h3 class="solutions icon">Innovative Solutions</h3>
      <p>We use advanced algorithms, applied mathematics, and machine learning techniques to solve some of the hardest
      problems in cloud computing.</p>
    </div>
    <div class="subsection">
      <h3 class="research icon">Open-Source Research</h3>
      <p>All our work is available under an open-source license and our results are disseminated in industry-leading
      venues and academic publications.</p>
    </div>
  </div>
  </div>
</section>

<section>
  <h2>Products and Services</h2>
  <h3>Stop guessing at your scale&mdash;simulate it!</h3>
  <div class="flex twocols">
    <div class="subsection">
      <h3>SimKube</h3>
      <p>A record-and-replay simulation environment for Kubernetes</p>
      <ul>
        <li>Increase reliability by replaying production data locally</li>
        <li>Identify future scaling bottlenecks in your Kubernetes platform</li>
        <li>Improve performance by tuning cluster configuration parameters</li>
        <li>Troubleshoot incidents and verify remediations in an isolated environment</li>
      </ul>
    </div>
    <div class="subsection">
      <h3>Scale-as-a-Service</h3>
      <p>Focused investigation into specific cost, scale, or reliability concerns</p>
      <ul>
        <li>Get full-time access to ACRL engineers to address specific concerns in your infrastructure</li>
        <li>Implement industry-standard best practices for autoscaling, scheduling, and reliability</li>
        <li>Improve your observability, testing, and deployment pipelines</li>
        <li>Receive training in modeling, experimentation, and analysis of complex systems</li>
      </ul>
    </div>
  </div>
  <div class="buttons center"><a  href="/services">View Services</a></div>
</section>

<section>
  <h2>Partners and Clients</h2>
  <div class="clients flex">
  <span class="client" id="mitali">
    <div class="grid">
      <img src="/img/testimonials/mitali.png">
      <a href="#" onclick="toggleDropdown('#mitali .testimonial'); return false;">Mitali Parasarathy, Director of Engineering, Yelp</a>
    </div>
    <a href="#" onclick="toggleDropdown('#mitali .testimonial'); return false;" class="testimonial">
      Mitali says, "David has been working on projects for Yelp for over a year bringing his expertise to
      implement autoscaling and telemetry for Java services and building out scalable development environments.  He did a
      great job communicating with stakeholders, identifying requirements and executing on developing and deploying
      high-quality solutions."
    </a>
    <div class="buttons center"><a class="external" href="https://engineeringblog.yelp.com/2024/08/multi-metric-paasta.html">Read more!</a></div>
  </span>

  <span class="client">
    <div class="grid">
      <img src="/img/testimonials/hmc.png">
      <a href="https://www.hmc.edu/clinic/sponsors-projects/">Harvey Mudd College Department of Computer Science Clinic Program</a>
    </div>
    <div class="buttons center">
      <a class="external" href="https://blog.appliedcomputing.io/p/exploring-the-kubernetes-graph">Read more!</a>
    </div>
  </span>
  </div>
</section>
