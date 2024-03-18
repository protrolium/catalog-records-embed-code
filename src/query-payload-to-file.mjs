// this will fetch the query and write the entire object to a query-payload.json

import fetch from 'node-fetch';
import fs from 'fs';

async function fetchCatalogRecords(artistAddress) {
    try {
        const response = await fetch('https://catalog-prod.hasura.app/v1/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                query GetCatalogRecords($artistAddress: String!) {
                    squidward_ {
                      token(where: {creator: {_eq: $artistAddress}}) {
                        track {
                          ipfs_hash_lossy_audio
                          ipfs_hash_artwork
                          short_url
                          artist {
                            handle
                          }
                        }
                        media {
                          metadata
                          royalty_bps
                          prev_owner_slice
                        }
                        cnft {
                          metadata
                          royalty_bps
                        }
                        token_id
                        token_contract
                        created_at_block_number
                        created_at_block_timestamp
                        created_at_tx_hash
                        creator
                        owner
                        token_transfer_events {
                          id
                          block_number
                          block_timestamp
                          from
                          to
                          transaction_hash
                        }
                        currentV1Ask {
                          id
                          amount
                          currency_address
                          buyer
                          seller
                          status
                          created_at_timestamp
                          created_at_block_number
                          finalized_at_timestamp
                          finalized_at_block_number
                          canceled_at_timestamp
                          canceled_at_block_number
                        }
                        currentV3Ask {
                          amount
                          currency_address
                          seller
                          status
                        }
                        currentV2Auction {
                          auction_id
                          reserve_price
                          currency_address
                          current_bidder
                          current_bid_amount
                          curator
                          curator_fee_percentage
                          duration
                          expected_end_timestamp
                          approved
                          status
                          seller
                          v2_bids {
                            amount
                            bidder
                            created_at_timestamp
                          }
                          winner
                        }
                        currentV3Auction {
                          reserve_price
                          currency_address
                          current_bidder
                          current_bid_amount
                          duration
                          expected_end_timestamp
                          status
                          seller
                          v3_auction_bids {
                            amount
                            bidder
                            created_at_timestamp
                          }
                          winner
                        }
                        v1asks(order_by: {created_at_block_number: desc}) {
                          id
                          amount
                          currency_address
                          buyer
                          seller
                          status
                          created_at_timestamp
                          created_at_block_number
                          finalized_at_timestamp
                          finalized_at_block_number
                          canceled_at_timestamp
                          canceled_at_block_number
                        }
                        v3asks {
                          id
                          amount
                          currency_address
                          buyer
                          seller
                          status
                          created_at_timestamp
                          created_at_block_number
                          finalized_at_timestamp
                          finalized_at_block_number
                          canceled_at_timestamp
                          canceled_at_block_number
                          v3_ask_price_updated_events {
                            amount
                            prev_amount
                            block_number
                            timestamp
                          }
                        }
                        v2auctions {
                          id
                          reserve_price
                          currency_address
                          current_bidder
                          current_bid_amount
                          curator
                          curator_fee_percentage
                          duration
                          expected_end_timestamp
                          approved
                          status
                          seller
                          v2_bids(order_by: {created_at_block_number: desc}) {
                            id
                            amount
                            bidder
                            created_at_timestamp
                          }
                          winner
                          created_at_timestamp
                          created_at_block_number
                          approved_at_timestamp
                          approved_at_block_number
                          finalized_at_timestamp
                          finalized_at_block_number
                          canceled_at_timestamp
                          canceled_at_block_number
                          v2_auction_reserve_price_updated_events {
                            block_number
                            block_timestamp
                            reserve_price
                          }
                        }
                        v3auctions {
                          reserve_price
                          currency_address
                          current_bidder
                          current_bid_amount
                          duration
                          expected_end_timestamp
                          status
                          seller
                          v3_auction_bids(order_by: {created_at_block_number: desc}) {
                            amount
                            bidder
                            created_at_timestamp
                          }
                          v3_auction_price_updated_events {
                            block_number
                            timestamp
                            reserve_price
                            prev_amount
                            sender
                            transaction_hash
                          }
                          winner
                          created_at_timestamp
                          created_at_block_number
                          finalized_at_timestamp
                          finalized_at_block_number
                          canceled_at_timestamp
                          canceled_at_block_number
                        }
                        v1offers {
                          amount
                          currency_address
                          offerer
                          created_at_timestamp
                          created_at_block_number
                          finalized_at_timestamp
                          finalized_at_block_number
                          canceled_at_timestamp
                          canceled_at_block_number
                          slice
                          status
                        }
                      }
                    }
                  }
                `,
                variables: {
                    artistAddress: "0xf2dB5Ff1a35524b05c2fDBe82fAd1AFe95FB05e1"
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        
        if (json.errors) {
            console.error('GraphQL errors:', json.errors);
            return;
        }

        const data = json.data.squidward_.token;
        console.log(data);
        
        const filePath = 'query-payload.json';

        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('An error occurred:', err);
                return;
            }
            console.log('JSON saved to', filePath);
        });

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Example of how to use the function
fetchCatalogRecords("0xf2dB5Ff1a35524b05c2fDBe82fAd1AFe95FB05e1")
    // .then(filteredData => console.log("Catalog Records:", filteredData))
    .catch(error => console.error("Fetch Error:", error));