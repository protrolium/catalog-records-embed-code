// running this via $ node get-filtered-array.mjs will export the desired query data to array.json, which the widget refers to

import fetch from 'node-fetch';
import fs from 'fs';
import { formatEther } from 'viem';

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
        // console.log(data);

        // parse JSON string to JSON object
        // const bodyJSON = JSON.parse(data);

        // response from server is already a JSON object, so we don't need to parse
        const bodyJSON = data;
        // console.log(bodyJSON);
        
        // filter for objects that have the media object
        const legacyContract = bodyJSON.filter(items => items.media !== null);
        // console.log(legacyContract);

        const ipfsString = "https://ipfs.io/ipfs/";
        const catalogSlug = "https://catalog.works/gavcloud/";
        // const ensName = await publicClient.getEnsName({ address: "0x1290F0b28f014363A81C3C7C2DFf5f7517499E44"})
        // console.log(ensName);

        // create a new object that contains ipfs_hash_lossy_audio, ipfs_hash_artwork, token_id
        const legacyItems = legacyContract.map(items => {
            let itemObject = {
                token_id: items.token_id,
                token_contract: items.token_contract,
                title: items.media.metadata.body.title,
                artist: items.media.metadata.body.artist,
                lossy_audio: `${ipfsString}${items.track.ipfs_hash_lossy_audio}`,
                artwork: `${ipfsString}${items.track.ipfs_hash_artwork}`,
                owner: items.owner,
                url: `${catalogSlug}${items.track.short_url}`,
                duration: (items.media.metadata.body.duration / 60).toFixed(2) + " minutes",
                mimetype: items.media.metadata.body.mimeType.replace("audio/", ""),
                mint_date: new Date(items.created_at_block_timestamp).toLocaleString('en-US', {
                    timeZone: 'America/Los_Angeles',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                })
                .replace(/\//g, '-') // Replace slashes with hyphens
                .replace(/, /, ' ') // Remove the comma and replace it with a space
            };

            
            // Check if v2auctions exists and is an array
            const winningBid = items.v2auctions?.[0];
            if (winningBid && (winningBid.winner !== null || winningBid.current_bid_amount !== null)) {
                itemObject.v2auction = {
                    winner: items.owner,
                    current_bid_amount: formatEther(BigInt(winningBid.current_bid_amount))
                };
            } else {
                itemObject.reserve_price = formatEther(BigInt(winningBid.reserve_price));
            }
            
            return itemObject;
        });
        // console.log(legacyItems);


        // filter for objects that have the cnft object
        const cnftContract = bodyJSON.filter(items => items.cnft !== null);
        // console.log(cnftContract);


        const cnftItems = cnftContract.map(items => {
            let itemObject = {
                token_id: items.token_id,
                token_contract: items.token_contract,
                title: items.cnft.metadata.title,
                artist: items.cnft.metadata.artist,
                lossy_audio: items.cnft.metadata.animation_url.replace("ipfs://", ipfsString),
                artwork: items.cnft.metadata.image.replace("ipfs://", ipfsString),
                url: `${catalogSlug}${items.track.short_url}`,
                duration: (items.cnft.metadata.duration / 60).toFixed(2) + " minutes",
                mimetype: items.cnft.metadata.mimeType.replace("audio/", ""),
                mint_date: new Date(items.created_at_block_timestamp).toLocaleString('en-US', {
                    timeZone: 'America/Los_Angeles',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                })
                .replace(/\//g, '-') // Replace slashes with hyphens
                .replace(/, /, ' ') // Remove the comma and replace it with a space
            }

            // Check if v2auctions exists and is an array
            const winningBid = items.v2auctions?.[0];
            if (winningBid && (winningBid.winner !== null || winningBid.current_bid_amount !== null)) {
                itemObject.v2auction = {
                    winner: items.owner,
                    current_bid_amount: formatEther(BigInt(winningBid.current_bid_amount))

                };
            } else {
                itemObject.reserve_price = formatEther(BigInt(items.v3auctions?.[0].reserve_price));
            }

            return itemObject;
        });

        // merge the legacyItems and cnftItems arrays to get our items
        let merged = [...legacyItems, ...cnftItems];
        console.log(merged);
                
        const filePath = 'array.json';

        fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf8', (err) => {
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
    // .then(merged => console.log(merged))
    .catch(error => console.error("Fetch Error:", error));