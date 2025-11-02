import { create } from 'zustand';

interface StoreState {
  // 自选股列表
  favorites: string[];
  addFavorite: (code: string) => void;
  removeFavorite: (code: string) => void;
  isFavorite: (code: string) => boolean;

  // 当前选中的股票
  selectedStock: string | null;
  setSelectedStock: (code: string | null) => void;

  // 搜索关键词
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;

  // 实时价格更新
  priceUpdates: Map<string, { price: number; change: number; changePercent: number }>;
  updatePrices: (updates: Array<{ code: string; price: number; change: number; changePercent: number }>) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),

  addFavorite: (code) => {
    const favorites = [...get().favorites, code];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    set({ favorites });
  },

  removeFavorite: (code) => {
    const favorites = get().favorites.filter(c => c !== code);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    set({ favorites });
  },

  isFavorite: (code) => {
    return get().favorites.includes(code);
  },

  selectedStock: null,
  setSelectedStock: (code) => set({ selectedStock: code }),

  searchKeyword: '',
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  priceUpdates: new Map(),
  updatePrices: (updates) => {
    const priceUpdates = new Map(get().priceUpdates);
    updates.forEach(update => {
      priceUpdates.set(update.code, {
        price: update.price,
        change: update.change,
        changePercent: update.changePercent,
      });
    });
    set({ priceUpdates });
  },
}));
