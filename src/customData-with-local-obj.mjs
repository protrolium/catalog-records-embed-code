// this was a test using the query-payload.json file locally to filter the data

import fs from 'fs';
import { formatEther } from 'viem';

const data = fs.readFileSync('output.json', 'utf-8');

// parse JSON string to JSON object
const bodyJSON = JSON.parse(data);
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
            winner: winningBid.winner,
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
            winner: winningBid.winner,
            current_bid_amount: formatEther(BigInt(winningBid.current_bid_amount))

        };
    } else {
        itemObject.reserve_price = formatEther(BigInt(items.v3auctions?.[0].reserve_price));
    }

    return itemObject;
});

// merge the legacyItems and cnftItems arrays to get our items
// let merged = [...legacyItems, ...cnftItems];

// needs to be stringified to be valid JSON with double quotes >:0
let merged = JSON.stringify([...legacyItems, ...cnftItems], null, 2);
console.log(merged);