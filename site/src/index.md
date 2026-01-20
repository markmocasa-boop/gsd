---
layout: layouts/base.hbs
title: Get Shit Done
description: "A lightweight meta-prompting, context engineering, and spec-driven development system for Claude Code."
permalink: /
---

<section class="hero">
  <div class="container hero-inner">
    <div class="hero-copy flow">
      <div class="hero-tags" aria-label="Key Concepts">
        <span class="tag">Claude Code</span>
        <span class="tag">Context Engineering</span>
        <span class="tag">Spec-Driven Development</span>
      </div>

      <h1>Build Like A Solo Dev, Ship Like A Team</h1>
      <p class="lede">GSD is the orchestration layer that makes Claude Code reliable: explicit phases, sub-plan tasks, verification criteria, and fast feedback loops — without enterprise theater.</p>

      <div class="cta-row">
        <a class="button primary" href="{{site.repoUrl}}" target="_blank" rel="noopener noreferrer">View On GitHub</a>
        <a class="button" href="{{site.npmUrl}}" target="_blank" rel="noopener noreferrer">Install From npm</a>
      </div>

      <div class="install">
        <code>npx get-shit-done-cc</code>
        <button class="copy" type="button" data-copy-text="npx get-shit-done-cc" data-copy-label="Copied">Copy</button>
        <span class="small">Works on Mac, Windows, and Linux.</span>
      </div>

      <p class="small">Trusted by engineers at Amazon, Google, Shopify, and Webflow.</p>
    </div>

    <figure class="hero-media frame">
      <img src="{{site.pathPrefix}}assets/img/terminal.svg" alt="GSD install screenshot">
      <figcaption>“If you know clearly what you want, this WILL build it for you. No bs.”</figcaption>
    </figure>
  </div>
</section>

<section class="section">
  <div class="container flow">
    <h2>Why GSD Exists</h2>

    <p>Vibecoding has a bad reputation because quality degrades as sessions grow. GSD is designed to keep the “big picture” stable while letting Claude work in focused bursts.</p>

    <ul>
      <li><strong>Plans are executable.</strong> Roadmaps turn into concrete tasks with measurable success criteria.</li>
      <li><strong>Fresh context per task.</strong> Each atomic task runs in a clean subagent context to fight context rot.</li>
      <li><strong>Verification is built in.</strong> Every plan includes checks (and human validation prompts when needed).</li>
    </ul>

    <div class="callout">
      <strong>No enterprise roleplay.</strong> GSD is intentionally optimized for solo developers who want output that holds up.
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container flow">
    <h2>What You Can Do With It</h2>

    <div class="card-grid">
      <div class="card">
        <h3>Start New Projects Faster</h3>
        <p>Turn a vague idea into a roadmap with phases, deliverables, and verification checkpoints.</p>
      </div>
      <div class="card">
        <h3>Ship In Tight Loops</h3>
        <p>Break work into atomic tasks, get clean commits as you go, and keep momentum.</p>
      </div>
      <div class="card">
        <h3>Stay Oriented</h3>
        <p>State and progress commands make it easy to jump back in after a break — with context intact.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container flow">
    <h2>Supporting The Project</h2>

    <p>GSD is actively maintained and evolving quickly. If you want it to keep improving — or you want to help make it sustainable — there are several ways to support.</p>

    <div class="video">
      <div class="video-embed">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/WlEZTFBRYw0?start=852"
          title="Support GSD"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
      <div class="flow">
        <blockquote class="quote">
          “I want to just go full-time working on GSD. I had no idea how I was going to do it, but my partner definitely was a little bit shocked when I was like, ‘Yeah, I’m all in on this thing that I’ve built and thousands of people are using it worldwide right now.’”
          <footer>— TÂCHES</footer>
        </blockquote>
        <p class="muted">That moment starts at <a href="https://www.youtube.com/live/WlEZTFBRYw0?t=852s" target="_blank" rel="noopener noreferrer">14:12</a>.</p>
        <div class="cta-row">
          <a class="button primary" href="{{site.pathPrefix}}support/">How To Support</a>
          <a class="button" href="{{site.repoUrl}}/stargazers" target="_blank" rel="noopener noreferrer">Star The Repo</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container flow">
    <h2>Next Steps</h2>

    <ol>
      <li><strong>Read the basics:</strong> start with <a href="{{site.pathPrefix}}getting-started/">Getting Started</a></li>
      <li><strong>Understand the system:</strong> see <a href="{{site.pathPrefix}}how-it-works/">How It Works</a></li>
      <li><strong>Run a real workflow:</strong> use <a href="{{site.pathPrefix}}commands/">Commands</a> as your reference</li>
    </ol>
  </div>
</section>
