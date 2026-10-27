This plan will roughly cover some of the things I'll do for the demo:

Find a common central topic and ask Claude (all levels from low to extra) a basic question (probably about "Where did the concept of 'Capital cities of the world' come from? When did it start? What measures are used to rank these cities? What influence do these cities have on the economy? Any interesting facts about this concept?") to see how the output changes with different levels of effort.

This question will be asked from a new chat and each will contain the effort label - I'll need to come up with an interesting conclusion to sum and point some interesting gotchas?

This will obviously be the first attempt, which will purely be based on "vibes"

Then for a "measured conclusion" - I'll ask Claude to build different versions of the same ID validator application - each app will have a different level of effort - the idea is to create different versions of README/CLAUDE markdowns for this app and show how Claude disregards efforts, and sometimes even models, when the context is not clear. The markdowns will be generated from worse to best and the same model - with just differing effort levels will be used - but there'll be a special case where Haiku (highest effort) or Sonnet will be used against Opus 5.5 (lowest effort) to compare

All these will be done inside the Claude app so that we can see the time taken for each run as these runs won't be done in realtime

Basic plan - which will be refined as we go along

The punchline on this will be that there's a lot of generic advise on this which does not make sense for all cases...

Important - effort dial controls reasoning budget - it basically answers (how much time and token can I spend on you running various checks in the background before the answer gets generated) - and what this means is that poor context is poor context - no matter which effort you chose. Things that requires public or general knowledge or even knowledge that was available for training won't be affected that much due to your effort level - but internal work
