---
layout: page
permalink: /personal/
title: Personal
---


<div id="personal">
    {% for post in site.categories.personal %}
    <article class="personal-item">
      <h4><a href="{{ site.baseurl }}{{ post.url }}">{% if post.title and post.title != "" %}{{post.title}}{% else %}{{post.excerpt |strip_html}}{%endif%}</a></h4>
    </article>
    {% endfor %}
  </div>
{% endfor %}
</div>
