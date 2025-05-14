import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

// QR Scanner component that takes an onScan callback prop
const QrScanner = ({ onScan }) => {
    // Create a ref for the video element and state for error handling
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    const controlsRef = useRef(null);

    // Set up QR code scanning when component mounts
    useEffect(() => {
        // Initialize QR code reader
        const codeReader = new BrowserQRCodeReader();
        let isMounted = true;

        // Start scanning from video device
        codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err, controls) => {
            if (controls && !controlsRef.current) {
                controlsRef.current = controls;
            }
            // If QR code is successfully scanned and component is still mounted
            if (result && isMounted) {
                onScan(result.getText());
            }
            // Handle errors that aren't just "no QR code found"
            if (err && !(err instanceof codeReader.NotFoundException)) {
                setError('Error scanning QR code');
            }
        });

        // Cleanup function to stop scanning when component unmounts
        return () => {
            isMounted = false;
            if (controlsRef.current) {
                controlsRef.current.stop();
            }
        };
    }, [onScan]);

    // Render video element and error message if present
    return (
        <div>
            <video ref={videoRef} style={{ width: '100%' }} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default QrScanner;