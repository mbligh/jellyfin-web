import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Image from './Image';
import * as userSettings from '../../scripts/settings/userSettings';

vi.mock('react-blurhash', () => ({
    BlurhashCanvas: () => <canvas data-testid='blurhash' />
}));
vi.mock('../../scripts/settings/userSettings', () => ({
    enableBlurhash: vi.fn(() => true)
}));

describe('card images', () => {
    let container: HTMLDivElement;
    let root: Root;
    const url = '/image.jpg';

    beforeEach(() => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        vi.mocked(userSettings.enableBlurhash).mockReturnValue(true);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    function render(imgUrl = url) {
        act(() => root.render(<Image imgUrl={imgUrl} blurhash='hash' containImage={false} />));
        const image = container.querySelector('img');
        if (!image) throw new Error('Image element missing');
        return image;
    }

    function placeholder() {
        return container.querySelector('[data-testid="blurhash"]');
    }

    it('uses native lazy loading without hiding the real image behind opacity', () => {
        const image = render();
        expect(image.getAttribute('src')).toBe(url);
        expect(image.getAttribute('loading')).toBe('lazy');
        expect(image.style.opacity).toBe('');
        expect(placeholder()).not.toBeNull();
    });

    it('removes the placeholder on load without waiting for a transition', () => {
        const image = render();
        act(() => image.dispatchEvent(new Event('load')));
        expect(placeholder()).toBeNull();
    });

    it('recognizes already loaded cached images', () => {
        vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
        vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(320);
        render();
        expect(placeholder()).toBeNull();
    });

    it('preserves the placeholder if loading fails', () => {
        const image = render();
        act(() => image.dispatchEvent(new Event('error')));
        expect(placeholder()).not.toBeNull();
    });

    it('resets the placeholder when the image URL changes', () => {
        const image = render();
        act(() => image.dispatchEvent(new Event('load')));
        expect(placeholder()).toBeNull();
        const nextImage = render('/other.jpg');
        expect(nextImage.getAttribute('src')).toBe('/other.jpg');
        expect(placeholder()).not.toBeNull();
    });

    it('does not require a placeholder to render the image', () => {
        vi.mocked(userSettings.enableBlurhash).mockReturnValue(false);
        const image = render();
        expect(placeholder()).toBeNull();
        expect(image.style.opacity).toBe('');
    });
});
