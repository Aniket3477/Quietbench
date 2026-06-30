# Launch Post Drafts

General rule for all three: post the JSON Formatter and Regex Tester as the lead (they're the most universally useful, lowest-friction tools to try in 10 seconds), mention the rest as "also included," and never open with adjectives like "powerful," "seamless," or "revolutionary." This audience is allergic to that register.

---

## Show HN (Hacker News)

**Title format:** `Show HN: Quietbench – Free dev utilities that run entirely in your browser`

**Post body:**

I built a small set of developer utilities (JSON formatter, regex tester, cron expression builder, WCAG contrast checker, and an API request tester) that run entirely client-side — nothing gets sent to a server, no signup, no tracking.

I built this mostly because I was tired of opening five different bookmarked tools, several of which have gotten more ad-heavy and slower over the past year. Wanted something fast, dark-mode by default, and that doesn't make me create an account to format some JSON.

A few things I tried to get right:
- The regex tester explains what your pattern actually does in plain English, not just whether it matches
- The cron builder shows the next 5 execution times so you can sanity-check a schedule before deploying it
- Everything updates live as you type — no submit buttons

It's a static site, no backend, built with React/Vite. Happy to answer questions about the build or take feedback — this is a side project, not trying to sell anything.

[link]

---

## dev.to

**Title:** I built a free, no-signup dev tools site because I was tired of ad-heavy formatters

**Tags:** #webdev #showdev #javascript #productivity

**Post body:**

Like a lot of developers, I have a handful of bookmarked utility sites I use constantly — JSON formatter, regex tester, that kind of thing. Over time most of them got slower, ad-heavier, or started asking for signups for basic features.

So I built my own small suite:

- **JSON Formatter** — format/validate/minify, with a tree view for nested objects
- **Regex Tester** — live match highlighting plus a plain-English breakdown of what your pattern does
- **Cron Builder** — visual builder + parser, shows your next 5 execution times
- **Contrast Checker** — WCAG AA/AAA contrast checking with a live preview
- **API Tester** — lightweight Postman-style request tester, no install

Everything runs client-side in the browser — no backend, no data leaves your machine, no account needed.

### A few implementation notes for anyone curious

The cron parser was the one piece I ended up writing from scratch rather than pulling in a library — wanted predictable behavior for the "next N execution times" calculation without dragging in a dependency that didn't quite fit. Happy to talk through that if anyone's curious or has a similar use case.

Built with React + Vite + Tailwind, deployed as a static site.

Would genuinely appreciate feedback — especially if anything looks broken on mobile, that's the area I'm least confident in right now.

[link]

---

## Reddit (r/webdev, r/SideProject, r/programming)

**Title:** Made a free no-signup dev tools site (JSON formatter, regex tester, cron builder, etc.)

**Post body:**

Built this over a few weeks because I wanted one place for the small utilities I use constantly instead of five different bookmarked tabs, most of which have gotten worse over time (more ads, signup walls for basic stuff).

What's in it right now:
- JSON formatter/validator with tree view
- Regex tester with live highlighting + plain-English pattern explanations
- Cron expression builder that shows next 5 run times
- WCAG contrast checker
- API request tester (basically a lightweight Postman in the browser)

Everything's client-side, no account, no data sent anywhere. Built with React/Vite, completely free.

Would love feedback, especially on anything that feels broken or missing — this is genuinely just trying to be useful, not trying to sell anything.

[link]

## Sequencing recommendation
Week 1: ship tools + meta tags + the 5 highest-intent long-tail pages. Week 2: Show HN first (it has the shortest visibility window — a post that doesn't gain traction in the first 2-3 hours effectively disappears, so timing matters: aim for a weekday, US morning Pacific time). Week 2-3: dev.to and the chosen subreddit, spaced a few days apart rather than same-day, so you're not splitting attention across three simultaneous comment threads. Ongoing from week 1: GitHub awesome-list PRs, since those don't have a "moment" the way HN/Reddit do — submit as soon as the site is stable.
