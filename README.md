# WaniKani Extractor
This is a small quick and dirty script used to extract passed _vocabulary_ 
from WaniKani. I use this to import known morphemes via MorphMan into
my sentences Anki deck.

This is a Node app, if you want to use it: `npm install` and then `npm run extract`.

To work properly, it expects a `.apiToken` file in this same folder. This file 
should contain a WaniKani API V2 token.

If you want to manually add already known words, create a `known.txt` file
with one word per line inside.

Don't complain with the code quality, I did this in less than one our on Sunday morning. :)
