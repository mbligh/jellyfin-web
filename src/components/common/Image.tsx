import React, { type FC, useCallback, useState } from 'react';
import { BlurhashCanvas } from 'react-blurhash';

import * as userSettings from '../../scripts/settings/userSettings';

const imageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
};

interface ImageProps {
    imgUrl: string;
    blurhash?: string;
    containImage: boolean;
}

const ImageContent: FC<ImageProps> = ({
    imgUrl,
    blurhash,
    containImage
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    // A cached image may already be available when React attaches the ref.
    const checkImage = useCallback((image: HTMLImageElement | null) => {
        if (image?.complete && image.naturalWidth > 0) {
            setIsLoaded(true);
        }
    }, []);

    return (
        <div>
            {!isLoaded && blurhash && userSettings.enableBlurhash() && (
                <BlurhashCanvas
                    hash={blurhash}
                    width= {20}
                    height={20}
                    punch={1}
                    style={{
                        ...imageStyle,
                        borderRadius: '0.2em',
                        pointerEvents: 'none'
                    }}
                />
            )}
            <img
                ref={checkImage}
                loading='lazy'
                alt=''
                src={imgUrl}
                style={{
                    ...imageStyle,
                    objectFit: containImage ? 'contain' : 'cover'
                }}
                onLoad={handleLoad}
            />

        </div>
    );
};

// Reset the placeholder when a card is reused for a different image.
const Image: FC<ImageProps> = (props) => <ImageContent key={props.imgUrl} {...props} />;

export default Image;
