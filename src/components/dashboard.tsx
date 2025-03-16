import { useState, useEffect } from 'react';
import { RSSExtractor, Feed, FeedItem } from './rss-extractor';

const RSSFeedDashboard = () => {
  const [feedUrl, setFeedUrl] = useState('');
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [currentFeed, setCurrentFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const extractor = new RSSExtractor();
  
  const addFeed = async () => {
    if (!feedUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const feed = await extractor.fetchFeed(feedUrl);
      setFeeds(prev => [...prev, feed]);
      setCurrentFeed(feed);
      setFeedUrl('');
    } catch (err) {
      setError(`Failed to fetch feed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date?: Date) => {
    return date ? date.toLocaleDateString() : 'Unknown date';
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">RSS Feed Dashboard</h1>
      
      {/* Feed Input */}
      <div className="flex mb-6">
        <input
          type="text"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          placeholder="Enter RSS feed URL"
          className="flex-1 p-2 border rounded-l"
        />
        <button
          onClick={addFeed}
          disabled={loading || !feedUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded-r disabled:bg-gray-300"
        >
          {loading ? 'Loading...' : 'Add Feed'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Feed List */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* Sidebar */}
  <div className="md:col-span-1 bg-gray-100 p-4 rounded">
    <h2 className="font-bold mb-2">My Feeds</h2>
    {feeds.length === 0 ? (
      <p className="text-gray-500">No feeds added yet</p>
    ) : (
      <>
        {feeds.map((feed, i) => (
          <div key={i} className="md:col-span-3 flex justify-center items-center min-h-screen">

            {/* Feed Content */}
            <div className="bg-white p-4 rounded shadow mb-4 w-full max-w-lg mx-auto">
              <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
              onClick={() => setCurrentFeed(feed)}
              className={`block w-full text-left p-2 rounded ${
                currentFeed === feed ? 'bg-blue-100' : 'hover:bg-gray-200'
              }`}
            >
              {feed.title || 'Untitled Feed'}
            </button>
                <input
                  type="number"
                  value={feed.articles}
                  onChange={(e) => {
                    const updatedFeeds = [...feeds];
                    updatedFeeds[i] = { ...updatedFeeds[i], articles: Number(e.target.value) };
                    setFeeds(updatedFeeds);
                  }}
                  className="border rounded p-2"
                  style={{ width: '40px' }}
                />

              {/* Display Feed Items */}
              {feed.items.slice(0, feed.articles).map((item, j) => (
                <div key={j} className="bg-white p-4 rounded shadow mb-4">
                  <h4 className="font-bold">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.title}
                    </a>
                  </h4>
                </div>
              ))}
            </div>
          </div>
          </div>
        ))}
      </>
    )}
  </div>
</div>
</div>
  );
};

export default RSSFeedDashboard;