# UWS Briefly: daily run

This repo powers the Instagram account @uws_briefly: short, factual summaries of Upper West Side
news from West Side Rag, I Love the Upper West Side and The West Sider, with credit to each source.

## Daily procedure (about 6 pm New York time)

1. `git pull origin main`, then `python3 tools/new_stories.py` to list stories not yet handled.
   If it fails for one source, carry on with the others and say so in the report.
2. Drop sponsored posts, ads, advice columns and personal essays. If nothing newsworthy is left,
   mark the URLs (step 6), post nothing, and stop.
3. Merge stories that cover the same event into one item that links to every source covering it.
   The West Sider publishes one long weekly issue: pull only the news items the other two sources
   have not already covered in the past week (check `links.json`).
4. Write one or two short sentences per story in the house voice: a longtime Upper West Sider who
   is direct and a bit annoyed by everything. Plain words, dry asides ("At the salad place.",
   "It took more than a year."), never cute. The facts stay exact: who/what/where/when, nothing the
   article does not state, no clickbait or teasing. Never copy sentences or use the sites' photos.
   - No jokes or asides about deaths, violence, missing people or victims. Just say it straight.
   - Crime: say "charged", "accused" or "indicted" unless there is a conviction or guilty plea.
   - Each story gets a blunt label (`cat`): "Someone died", "New restaurant", "Closing", "Roaches",
     "New building", "Landlord", "Crime", "Cop accused", "Subway mess", "Finally", "Neighbors are mad".
     Labels must not assert guilt ("Cop accused", not "Cop gone bad", until a conviction) and must
     not insult a named private person or business beyond what the article reports.
5. Create `editions/YYYY-MM-DD/edition.json` (same shape as earlier editions: `dates`, `stories`
   with `cat`, `text`, `src`; optional `sources`; `caption`). At most 8 story slides, most
   important first; extra stories go in the caption only. The caption lists each one-liner, then
   "Links to every story are in our bio." and "Reporting by <sources used>." (the caption and the
   "Via" line on each slide are where sources get credit; the closing slide only points to the
   link in bio and names no sites) and
   `#upperwestside #uws #nyc`. Run `node tools/render.js editions/<date>/edition.json editions/<date>`
   and look at one or two slides to check nothing is clipped.
6. Add each story to the top of `links.json` (`date`, `headline`, `links` as `[source, url]` pairs,
   every source that covered it), run `python3 tools/build_page.py`, and record every URL from
   step 1 (used or not) with `python3 tools/new_stories.py --mark URL ...`.
7. Commit and push to `main`. Confirm a slide URL returns 200 at
   `https://raw.githubusercontent.com/itsmefrances/uws-briefly/<commit>/editions/<date>/slide-01.png`.
8. Republish the links page (https://uws-briefly.onrender.com, the address in the Instagram bio):
   with the Render connector, `trigger_deploy` for the static site `uws-briefly`
   (service `srv-dbqcirjbc2fs73d0in9g`, workspace "UWS Briefly"), since pushes may not deploy
   on their own. Never put the GitHub address in a caption, slide or the page itself.
9. Publish with the Buffer connector: `create_post` to the Instagram channel `uws_briefly`
   (find it with `get_account` then `list_channels`), `mode: shareNow`,
   `schedulingType: automatic`, `metadata.instagram: {type: "post", shouldShareToFeed: true}`,
   one image asset per slide (commit-pinned raw URLs, alt text = the slide's sentence).
   Check with `get_post` that the status is `sent` and report the Instagram link.

The owner chose automatic publishing with no review, so accuracy matters more than coverage:
when unsure about a fact, leave the story out.
