// @ts-nocheck
/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import '../styles.css';

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tokenRef = useRef<string | undefined>();
  const [readyToClaim, setReadyToClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [ad, setAd] = useState<{ id: string; videoUrl: string; trackers?: string[] } | null>(null);

  // Call ready once component is mounted
  useEffect(() => {
    sdk.actions.ready().catch(() => {
      /* ignore when not in mini app */
    });
  }, []);

  // Fetch ad on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/getAd');
        if (res.ok) {
          setAd(await res.json());
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // Obtain quickAuth token once
  useEffect(() => {
    (async () => {
      try {
        const { token } = await sdk.experimental.quickAuth();
        tokenRef.current = token;
      } catch {/* ignore */}
    })();
  }, []);

  // Attach video end listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = async () => {
      setReadyToClaim(true);
      try {
        const context = await sdk.context;
        if (context.features?.haptics) {
          await sdk.actions.haptics.notificationOccurred('success');
        }
        // Fire impression trackers
        ad?.trackers?.forEach((url) => {
          const img = new Image();
          img.src = url;
        });

        // Notify backend of completion
        if (ad && tokenRef.current) {
          fetch('/api/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenRef.current, adId: ad.id }),
          });
        }
      } catch {
        /* noop */
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await sdk.actions.composeCast({
        text: 'I just earned crypto by watching an ad on Adcaster! 🚀',
        embeds: [window.location.href],
        close: false,
      });
    } catch {
      /* user may cancel */
    }
    // TODO: reward transfer logic
    setClaimed(true);
    setClaiming(false);
  };

  return (
    <div className="container">
      <img
        src="https://raw.githubusercontent.com/farcasterxyz/assets/main/miniapp.png"
        alt="Adcaster logo"
        className="logo"
      />
      <h1 className="title">Watch ads. Earn crypto.</h1>
      {ad ? (
        <video
          ref={videoRef}
          className="video"
          controls
          playsInline
          poster="https://raw.githubusercontent.com/farcasterxyz/assets/main/preview.png"
        >
          <source src={ad.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Loading ad…</p>
      )}

      {readyToClaim && (
        <div className="claim-section">
          <button
            className="claim-button"
            onClick={handleClaim}
            disabled={claimed || claiming}
          >
            {claiming ? 'Processing…' : claimed ? 'Reward claimed! ✅' : 'Claim your reward'}
          </button>
        </div>
      )}
    </div>
  );
} 