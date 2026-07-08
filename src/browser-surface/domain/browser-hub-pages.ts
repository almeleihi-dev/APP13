export function renderCustomerHubPage(): string {
  return [
    `<section data-page="customer-hub">`,
    `<h1>Customer Hub</h1>`,
    `<p>Browse customer-facing browser entry points and authenticated JSON dashboards.</p>`,
    `<ul data-region="customer-hub-links">`,
    `<li><a href="/home" data-surface="html">Authenticated Home Hub</a></li>`,
    `<li><a href="/marketplace" data-surface="html">Marketplace Discovery</a></li>`,
    `<li><a href="/browse" data-surface="html">Browser Surface Catalog</a></li>`,
    `<li><a href="/contracts" data-surface="html">Contract Journey</a></li>`,
    `<li><a href="/contracts/review" data-surface="html">Contract Review</a></li>`,
    `<li><a href="/home/customer" data-surface="json_api">Customer JSON Dashboard</a></li>`,
    `</ul>`,
    `</section>`,
  ].join("\n");
}

export function renderMarketplaceResultsLink(): string {
  return [
    `<p data-region="marketplace-results-link">`,
    `<a href="/marketplace/results">View demo marketplace results</a>`,
    `</p>`,
  ].join("\n");
}

export function renderContractsHubLinks(): string {
  return [
    `<nav data-region="contracts-hub-links">`,
    `<ul>`,
    `<li><a href="/execution/dashboard" data-surface="html">Execution Dashboard</a></li>`,
    `<li><a href="/trust/center" data-surface="html">Trust Center</a></li>`,
    `<li><a href="/disputes/dashboard" data-surface="html">Dispute Dashboard</a></li>`,
    `<li><a href="/marketplace/results" data-surface="html">Marketplace Results</a></li>`,
    `</ul>`,
    `</nav>`,
  ].join("\n");
}
