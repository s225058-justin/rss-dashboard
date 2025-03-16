interface FeedItem {
    id: string;
    title: string;
    link: string;
  }
  
interface Feed {
    title: string;
    link: string;
    items: FeedItem[];
    articles: number;
}

class RSSExtractor {
    private feeds: Map<string, Feed>;
    private proxy: string = 'https://thingproxy.freeboard.io/fetch/';
    constructor() {
        this.feeds = new Map<string, Feed>();
    }

    /**
     * Fetch and parse an RSS feed
     * @param feedUrl URL of the RSS feed to fetch
     * @returns A Promise resolving to the parsed Feed object
     */

    async fetchFeed(feedUrl: string): Promise<Feed> {
        try {
        const response = await fetch(this.proxy + feedUrl);
        
        if (!response.ok) {
            throw new Error(`: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        return this.parseFeed(text, feedUrl);
        } catch (error) {
        console.error(`Error fetching feed from ${feedUrl}:`, error);
        throw error;
        }
    }

    /**
     * Parse XML content of an RSS feed
     * @param xmlContent XML content of the RSS feed
     * @param feedUrl Original URL of the feed (used as key)
     * @returns The parsed Feed object
     */
    parseFeed(xmlContent: string, feedUrl: string): Feed {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        
        // Handle potential parsing errors
        const parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
        throw new Error("Invalid XML content");
        }

        // Extract feed information
        const channel = xmlDoc.querySelector("channel") || xmlDoc.querySelector("feed");
        if (!channel) {
        throw new Error("Invalid RSS feed format");
        }

        // Determine if it's RSS or Atom format
        const isAtom = xmlDoc.querySelector("feed") !== null;
        
        const feed: Feed = {
        title: this.getElementText(channel, isAtom ? "title" : "title") || "Untitled Feed",
        link: this.getElementText(channel, isAtom ? "link" : "link") || feedUrl,
        items: [],
        articles:5,
        };

        // Extract feed items
        const itemElements = isAtom 
        ? xmlDoc.querySelectorAll("entry")
        : xmlDoc.querySelectorAll("item");
        
        itemElements.forEach(item => {
        const feedItem: FeedItem = {
            id: this.getElementText(item, isAtom ? "id" : "guid") || 
                this.getElementText(item, "link") || 
                `${feed.title}-${Math.random().toString(36).substring(2, 15)}`,
            title: this.getElementText(item, "title") || "No title",
            link: isAtom 
            ? this.getElementAttribute(item, "link", "href") || ""
            : this.getElementText(item, "link") || "",
        };
        
        console.log(feedItem)
        feed.items.push(feedItem);
        });

        // Save and return the feed
        this.feeds.set(feedUrl, feed);
        return feed;
    }

    /**
     * Get text content of an XML element
     */
    private getElementText(parent: Element, selector: string): string | null {
        const element = parent.querySelector(selector);
        return element ? element.textContent : null;
    }

    /**
     * Get attribute of an XML element
     */
    private getElementAttribute(parent: Element, selector: string, attr: string): string | null {
        const element = parent.querySelector(selector);
        return element ? element.getAttribute(attr) : null;
    }

    /**
     * Get text content of multiple XML elements
     */
    private getElementsText(parent: Element, selector: string): string[] {
        const elements = parent.querySelectorAll(selector);
        return Array.from(elements).map(el => el.textContent || "").filter(text => text !== "");
    }

    /**
     * Extract image URL from a feed item
     */
    private extractImageUrl(item: Element, isAtom: boolean): string | undefined {
        // Try different methods to find images
        // First check for media:content or media:thumbnail
        const mediaContent = item.querySelector("media\\:content, media\\:thumbnail");
        if (mediaContent && mediaContent.getAttribute("url")) {
        return mediaContent.getAttribute("url") || undefined;
        }
        
        // Check for enclosure with image type
        const enclosure = item.querySelector("enclosure");
        if (enclosure && 
            enclosure.getAttribute("type")?.startsWith("image/") && 
            enclosure.getAttribute("url")) {
        return enclosure.getAttribute("url") || undefined;
        }
        
        // Check for image element (RSS 2.0)
        const image = item.querySelector("image");
        if (image) {
        const url = image.querySelector("url");
        if (url && url.textContent) {
            return url.textContent;
        }
        }
        
        return undefined;
    }

    /**
     * Parse date string from feed
     */
    private parseDate(dateStr: string | null): Date | undefined {
        if (!dateStr) return undefined;
        
        try {
        return new Date(dateStr);
        } catch (e) {
        console.warn("Could not parse date:", dateStr);
        return undefined;
        }
    }

    /**
     * Get a feed by URL
     */
    getFeed(feedUrl: string): Feed | undefined {
        return this.feeds.get(feedUrl);
    }

    /**
     * Get all feeds
     */
    getAllFeeds(): Feed[] {
        return Array.from(this.feeds.values());
    }

    /**
     * Export feeds to JSON
     */
    exportToJSON(): string {
        const feedsObject: Record<string, Omit<Feed, 'items'> & { items: number }> = {};
        
        this.feeds.forEach((feed, url) => {
        feedsObject[url] = {
            title: feed.title,
            link: feed.link,
            items: feed.items.length,
            articles: 5,
        };
        });
        
        return JSON.stringify(feedsObject, null, 2);
    }
}

export { RSSExtractor };
export type { Feed, FeedItem };