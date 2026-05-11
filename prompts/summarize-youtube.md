---
description: Summarize a YouTube video from URL or transcript
argument-hint: <youtube-url or video-id>
---

# Summarize YouTube Command

Extract key information and create a structured summary from a YouTube video.

---

## Input: $ARGUMENTS

The user should provide either:
- A full YouTube URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
- A short YouTube URL (e.g., `https://youtu.be/VIDEO_ID`)
- Just the video ID

---

## Step 1: Extract Video ID

Parse the input to get the video ID:
- From full URL: extract `v=` parameter
- From short URL: extract path after `youtu.be/`
- Direct ID: use as-is

---

## Step 2: Fetch Video Information

Use WebFetch to get the video page and extract:
- Video title
- Channel name
- Duration
- Description

```
WebFetch URL: https://www.youtube.com/watch?v={VIDEO_ID}
```

---

## Step 3: Get Transcript

Try to fetch the transcript using one of these methods:

### Option A: YouTube Transcript API (if available via MCP)
Check if there's an MCP tool for YouTube transcripts.

### Option B: Use a transcript service
```
WebFetch URL: https://www.youtube.com/watch?v={VIDEO_ID}
Prompt: Extract the video title, description, and any available transcript or captions
```

### Option C: Ask user for transcript
If transcript cannot be fetched automatically, ask the user to:
1. Copy the transcript from YouTube (click "..." → "Show transcript")
2. Paste it into the chat

---

## Step 4: Generate Summary

Create a structured summary with these sections:

```markdown
# 📺 Video Summary

**Title**: [Video Title]
**Channel**: [Channel Name]
**Duration**: [Length]
**URL**: [Original URL]

---

## 🎯 TL;DR (One-liner)

[Single sentence capturing the main point]

---

## 📋 Key Points

1. **[Point 1 Title]**: [Brief explanation]
2. **[Point 2 Title]**: [Brief explanation]
3. **[Point 3 Title]**: [Brief explanation]
[Continue as needed...]

---

## 💡 Main Takeaways

- [Actionable insight 1]
- [Actionable insight 2]
- [Actionable insight 3]

---

## 🗒️ Detailed Notes

### [Section/Topic 1]
[Detailed notes with timestamps if available]

### [Section/Topic 2]
[Detailed notes with timestamps if available]

---

## 📚 Resources Mentioned

- [Any tools, books, links mentioned in the video]

---

## 🏷️ Tags

`#tag1` `#tag2` `#tag3`
```

---

## Step 5: Ask for Output Preference

Use AskUserQuestion to ask:

**Question**: "How would you like the summary?"

Options:
1. **Full summary** - Complete structured summary (default)
2. **Quick summary** - Just TL;DR and key points
3. **Save to file** - Save summary as markdown file
4. **Copy-friendly** - Plain text format for copying

---

## Step 6: Deliver Summary

Based on user preference:
- **Full/Quick**: Output directly in chat
- **Save to file**: Write to `.project/notes/youtube/[video-title].md`
- **Copy-friendly**: Output without markdown formatting

---

## Error Handling

If video cannot be accessed:
1. Check if URL is valid
2. Check if video is public
3. Ask user to provide transcript manually

If transcript not available:
1. Summarize based on title and description
2. Ask user to paste transcript
3. Offer to summarize user's notes about the video

---

## Example Usage

```
/summarize-youtube https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

Output:
```
# 📺 Video Summary

**Title**: Rick Astley - Never Gonna Give You Up
**Channel**: Rick Astley
**Duration**: 3:33

## 🎯 TL;DR
Classic 1987 music video featuring Rick Astley's iconic song about commitment and loyalty.

## 📋 Key Points
1. **Timeless Hit**: One of the most recognizable songs from the 80s
2. **Internet Culture**: Became famous as "Rickrolling" meme
...
```
