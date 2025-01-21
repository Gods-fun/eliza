import { Request as ExpressRequest } from "express";

const authenticate = (req: ExpressRequest, res: any, next: any) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const apiKeyHeader = req.headers.authorization;

    // Get the origin and API key pairs from the environment variable
    const originApiKeyPairs = (process.env.ORIGIN_APIKEY_PAIRS || "").split(
        ";"
    );
    const trustedDomains = originApiKeyPairs.map((pair) => pair.split(",")[0]);

    // Allow local request
    if (req.hostname === "localhost" || req.hostname === "127.0.0.1") {
        return next();
    }

    // Check if the request is coming from a trusted domain
    if (origin && referer) {
        const originDomain = new URL(origin).hostname;
        const refererDomain = new URL(referer).hostname;

        if (
            !trustedDomains.includes(originDomain) ||
            !trustedDomains.includes(refererDomain)
        ) {
            return res.status(403).send("Forbidden");
        }
    }

    // Check if the API key is provided and valid
    if (!apiKeyHeader) {
        return res.status(403).send("Forbidden");
    }

    const apiKey = apiKeyHeader.split(" ")[1];

    const validOrigin = originApiKeyPairs.find(
        (pair) => pair.split(",")[0] === origin && pair.split(",")[1] === apiKey
    );

    if (!validOrigin) {
        return res.status(403).send("Forbidden");
    }

    // Set CORS headers to restrict the domains that can access your API
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    next();
};

export default authenticate;
