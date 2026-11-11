# UWS Briefly

Weekly one-line summaries of Upper West Side news, posted to Instagram as @uws_briefly.

All reporting belongs to [West Side Rag](https://www.westsiderag.com/),
[I Love the Upper West Side](https://www.ilovetheupperwestside.com/) and
[The West Sider](https://www.thewestsidernyc.com/). Read the full stories there.

- `editions/YYYY-MM-DD/`: that week's stories (`edition.json`) and carousel slides (`slide-NN.png`).
- `tools/new_stories.py`: lists stories from West Side Rag, I Love the Upper West Side and The West Sider that have not been posted yet (tracked in `posted.json`).
- `tools/render.js`: turns an `edition.json` into 1080×1350 slides (`node tools/render.js editions/<date>/edition.json editions/<date>`).
