import { useState, useEffect } from "react";
import { RSSExtractor, Feed } from "./rss-extractor";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const RSSFeedDashboard = () => {
  const DEFAULT_FEEDS = [
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    "https://feeds.theguardian.com/theguardian/world/rss",
    "https://engineering.fb.com/feed/",
    "https://blog.cloudflare.com/rss/",
    "https://stackoverflow.blog/feed/",
  ];
  const [feedUrl, setFeedUrl] = useState("");
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentFeed, setCurrentFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(false);
  const extractor = new RSSExtractor();

  const addFeed = async () => {
    if (!feedUrl) return;

    setLoading(true);
    setError(null);

    try {
      const feed = await extractor.fetchFeed(feedUrl);
      setFeeds((prev) => [...prev, feed]);
      setCurrentFeed(feed);
      setFeedUrl("");
    } catch (err) {
      setError(`Failed to fetch feed: Perhaps your RSS link is invalid?`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeFeeds = async () => {
      for (const defaultFeed of DEFAULT_FEEDS) {
        try {
          const feed = await extractor.fetchFeed(defaultFeed);
          setFeeds((prev) => [...prev, feed]);
        } catch (e) {
          console.error(`Failed to add default feed ${defaultFeed}:`, e);
        }
      }
    };

    initializeFeeds();
  }, []);

  return (
    <div className="container-fluid p-0 vh-100 d-flex">
      <div
        className="col-2 bg-light p-4 border-end overflow-auto"
        style={{ height: "100vh" }}
      >
        <h2 className="h4 fw-bold mb-4">My Feeds</h2>
        {feeds.length === 0 ? (
          <p className="text-muted">No feeds added yet</p>
        ) : (
          feeds.map((feed, index) => (
            <div key={index} className="d-flex mb-2">
              <button
                className={`btn ${
                  currentFeed === feed ? "btn-primary" : "btn-outline-primary"
                } flex-grow-1 text-start text-truncate me-1`}
                onClick={() => setCurrentFeed(feed)}
              >
                {feed.title || "Untitled Feed"}
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  setFeeds(feeds.filter((_, i) => i !== index));
                  if (currentFeed === feed) setCurrentFeed(null);
                }}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="col-10 d-flex flex-column" style={{ height: "100vh" }}>
        <div
          className="p-4 bg-light border-bottom d-flex flex-column justify-content-center"
          style={{ height: "20%" }}
        >
          <h1 className="h2 fw-bold mb-4">RSS Feed Dashboard</h1>
          <div className="input-group">
            <input
              type="text"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="Enter RSS feed URL"
              className="form-control"
            />
            <button
              onClick={addFeed}
              disabled={loading || !feedUrl}
              className="btn btn-primary"
            >
              {loading ? "Loading..." : "Add Feed"}
            </button>
          </div>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="p-4 overflow-auto" style={{ height: "80%" }}>
          {currentFeed ? (
            currentFeed.items.map((item, i) => (
              <div
                key={i}
                className="mb-4 border"
                style={{ padding: "10px", borderRadius: "4px" }}
              >
                <div
                  className={`row align-items-center ${
                    item.description && item.description.trim() !== ""
                      ? "border-bottom"
                      : ""
                  } pb-2 mb-2`}
                >
                  {/* Title Column */}
                  <div className="col-9">
                    <h4 className="fw-bold mb-0">
                      <a
                        href={item.link}
                        className="text-primary text-decoration-none"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                    </h4>
                  </div>

                  <div className="col-3 text-end">
                    <p className="fw-light mb-0">
                      {item.author},{" "}
                      {item.publishDate
                        ? item.publishDate.toLocaleDateString()
                        : "No Date Available"}
                    </p>
                  </div>
                </div>
                {item.description && item.description.trim() !== "" && (
                  <p className="fw-normal">{item.description}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted">Select a feed from the sidebar</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RSSFeedDashboard;
