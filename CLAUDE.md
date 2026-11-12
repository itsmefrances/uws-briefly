# UWS Briefly: hourly run

This repo powers the Instagram account @uws_briefly: short, factual summaries of Upper West Side
news from West Side Rag, I Love the Upper West Side and The West Sider, with credit to each source.

Each new story becomes its own post: one image card, published soon after the article appears.
The run fires hourly from 7 am to 10 pm New York time.

## Hourly procedure

1. `git pull origin main`, then `python3 tools/new_stories.py` to list stories not yet handled.
   If it fails for one source, carry on with the others and say so in the report.
   If the list is empty, stop and reply with one line ("Nothing new."). Do nothing else.
2. Drop sponsored posts, ads, advice columns, puzzles, cartoons and personal essays. Mark their
   URLs (step 6) so they are not looked at again.
3. Merge stories that cover the same event into one item that links to every source covering it.
   If a story was already posted from another source (check `links.json`), do not post it again:
   just add the new source's link to that entry. The West Sider publishes one long weekly issue:
   pull at most 3 news items from it that the other two sources have not covered in the past week.
   At most 4 posts per run, most important first; leave the rest unmarked for the next hour.
4. Write one or two short sentences per story in the house voice: a longtime Upper West Sider who
   is direct and a bit annoyed by everything. Plain words, dry asides ("At the salad place.",
   "It took more than a year."), never cute. The facts stay exact: who/what/where/when, nothing the
   article does not state, no clickbait or teasing. Never copy sentences or use the sites' photos.
   - No jokes or asides about deaths, violence, missing people or victims. Just say it straight.
   - Crime: say "charged", "accused" or "indicted" unless there is a conviction or guilty plea.
   - Each story gets a blunt label: "Someone died", "New restaurant", "Closing", "Roaches",
     "New building", "Landlord", "Crime", "Cop accused", "Subway mess", "Finally", "Neighbors are mad".
     Labels must not assert guilt ("Cop accused", not "Cop gone bad", until a conviction) and must
     not insult a named private person or business beyond what the article reports.
5. Render one card per story:
   `node tools/card.js editions/YYYY-MM-DD/HHMM-<n>.png "Nov 12" "<label>" "<text>" "<source(s)>"`
   and look at it to check nothing is clipped. Save the caption next to it as `HHMM-<n>.txt`:
   the text, a blank line, "Full story: link in bio.", "Reporting by <sources used>.", a blank
   line, `#upperwestside #uws #nyc`. The card and caption credit the sources by name; never put
   the GitHub address in a caption, card or the links page.
6. Add each story to the top of `links.json` (`date`, `headline`, `links` as `[source, url]` pairs,
   every source that covered it), run `python3 tools/build_page.py`, and record every URL handled
   in this run (used or dropped) with `python3 tools/new_stories.py --mark URL ...`.
7. Commit and push to `main`. Confirm a card URL returns 200 at
   `https://raw.githubusercontent.com/itsmefrances/uws-briefly/<commit>/editions/<date>/<file>.png`.
8. Republish the links page (https://uws-briefly.onrender.com, the address in the Instagram bio):
   with the Render connector, `trigger_deploy` for the static site `uws-briefly`
   (service `srv-dbqcirjbc2fs73d0in9g`, workspace "UWS Briefly").
9. Publish. Instagram has been rejecting automated posts from this account as spam, so read
   `state.json` first:
   - If `auto_rejected_on` is today's date (New York), do NOT try Instagram. Go to step 10.
   - Otherwise try one post with the Buffer connector: `create_post` to the Instagram channel
     `uws_briefly` (`get_account` then `list_channels`), `mode: shareNow`,
     `schedulingType: automatic`, `metadata.instagram: {type: "post", shouldShareToFeed: true}`,
     one image asset (commit-pinned raw URL, alt text = the card's sentence). Wait about a minute
     and check with `get_post`. If `sent`, report the Instagram link and post the remaining
     stories the same way, one at a time. If `error`, delete the failed post from Buffer, set
     `auto_rejected_on` to today in `state.json` (commit and push), and go to step 10 for this
     story and every remaining one. Never retry a rejected post.
10. Hand-off: send the owner each card with SendUserFile and paste its caption in the report in a
    code block, so they can post it by hand from the Instagram app.

Finish with a short report: what was posted (with links) or handed off, and any source that failed.

The owner chose automatic publishing with no review, so accuracy matters more than coverage:
when unsure about a fact, leave the story out.

## Other tools

`tools/render.js` builds a multi-slide carousel from an `edition.json` (used for the weekly
roundups in `editions/`). It is not part of the hourly run.
