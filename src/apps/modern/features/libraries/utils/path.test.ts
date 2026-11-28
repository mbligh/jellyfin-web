import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as userSettings from 'scripts/settings/userSettings';

import { getDefaultViewIndex } from './path';

vi.mock('scripts/settings/userSettings', () => ({
    get: vi.fn()
}));

describe('getDefaultViewIndex', () => {
    const libraryId = 'youtube-library';

    beforeEach(() => {
        vi.mocked(userSettings.get).mockReset().mockReturnValue(null);
    });

    it('uses the server-aware preference for the library landing tab', () => {
        vi.mocked(userSettings.get).mockImplementation((key, enableOnServer) => {
            return key === 'landing-' + libraryId && enableOnServer !== false
                ? 'episodes'
                : null;
        });

        expect(getDefaultViewIndex('/tv', libraryId)).toBe(5);
        expect(userSettings.get).toHaveBeenCalledWith('landing-' + libraryId);
    });

    it('retains the default tab if the preference is unset', () => {
        expect(getDefaultViewIndex('/tv', libraryId)).toBe(0);
    });

    it('retains the default tab if the preference is invalid', () => {
        vi.mocked(userSettings.get).mockReturnValue('invalid');
        expect(getDefaultViewIndex('/tv', libraryId)).toBe(0);
    });

    it('does not read a preference if no library ID is available', () => {
        expect(getDefaultViewIndex('/tv')).toBe(0);
        expect(userSettings.get).not.toHaveBeenCalled();
    });

    it('respects other libraries and valid default screens', () => {
        vi.mocked(userSettings.get).mockReturnValue('collections');
        expect(getDefaultViewIndex('/movies', 'movie-library')).toBe(3);
        expect(userSettings.get).toHaveBeenCalledWith('landing-movie-library');
    });
});
