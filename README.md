# rss-dashboard
To run the preview, run the following command after cloning the repository.

``` npm run start-all ```

I used Vite to build the project, Node.js for the backend and React for the frontend.
Although I am familiar with React through previous projects, it utilised a Ruby-on-Rails backend and the JavaScript variant of React.
For this project, I decided to utilise Node.js as it was simpler to setup than Ruby-on-Rails and the TypeScript variant of React out of curiosity.

I wanted this dashboard to run entirely on the frontend, which proved challenging as that meant I could not fetch the RSS feeds directly due to CORS.
I instead used a proxy server, https://thingproxy.freeboard.io/fetch/, to help fetch the RSS feeds which I could then process. 
I used Claude to help generate the part of the code that I was unfamiliar with (extracting data from the RSS feed) as Claude generally gives me the best performance when generating longer sections of code in my opinion. 
The chat history is available here.
https://claude.ai/share/bba47973-9186-4de2-9af7-f11a20e432fb

After that, I built the visual part of the dashboard while utilising ChatGPT and Perplexity for debugging. I used Perplexity to search up the more confusing errors as I find Perplexity's search functionality to be the best and ChatGPT to help debug, cleanup and optimise smaller sections of code. Perplexity's small token window makes it difficult to work with chains of information, whereas Claude's restrictive limits reserves it for only the most difficult problems while ChatGPT is a middle ground between both. 
