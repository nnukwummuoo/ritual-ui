'use server'
import Mux from '@mux/mux-node';

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function processMyStorjVideo(storjRawUrl: string) {
    try {
        const asset = await mux.video.assets.create({
            inputs: [{ url: storjRawUrl }],
            playback_policy: ['public'], // This makes it fast and easy to play
            encoding_tier: 'baseline',    // Baseline is optimized for social media feeds
        });

        return {
            playbackId: asset.playback_ids?.[0].id,
            assetId: asset.id,
            status: asset.status
        };
    } catch (error) {
        console.error("Error processing video with Mux:", error);
        throw error;
    }
}
