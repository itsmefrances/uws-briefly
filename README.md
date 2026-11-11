# UWS Briefly

Weekly one-line summaries of Upper West Side news, posted to Instagram as @uws_briefly.

All reporting belongs to [West Side Rag](https://www.westsiderag.com/) and
[I Love the Upper West Side](https://www.ilovetheupperwestside.com/). Read the full stories there.

- `editions/YYYY-MM-DD/`: that week's stories (`edition.json`) and carousel slides (`slide-NN.png`).
- `tools/parse_feeds.py`: reads the two sites' RSS feeds.
- `tools/render.js`: turns an `edition.json` into 1080×1350 slides (`node tools/render.js editions/<date>/edition.json editions/<date>`).
