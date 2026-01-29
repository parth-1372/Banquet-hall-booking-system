import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

const PanoramicViewer = ({ imageUrl, height = '500px' }) => {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !imageUrl) return;

        viewerRef.current = new Viewer({
            container: containerRef.current,
            panorama: imageUrl,
            defaultZoomLvl: 50,
            navbar: ['zoom', 'move', 'fullscreen'],
            loadingTxt: 'Loading Virtual Tour...',
        });

        return () => {
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [imageUrl]);

    return (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
            <div
                ref={containerRef}
                style={{ width: '100%', height }}
                className="bg-slate-900"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    360° Virtual Tour
                </span>
            </div>
        </div>
    );
};

export default PanoramicViewer;
