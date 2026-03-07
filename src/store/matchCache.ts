

export const MatchDataCache = {
    _cache: new Map<string, any>(),
    set(id: string, data: any) {
        this._cache.set(id, data);
    },
    get(id: string) {
        return this._cache.get(id);
    },
    has(id: string) {
        return this._cache.has(id);
    },
    clear() {
        this._cache.clear();
    }
};
