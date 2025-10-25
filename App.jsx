import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, MapPin, ExternalLink } from "lucide-react";

const SHEET_ID = '19O0ge4LPff4dkPomR3tWJvH6C7zCufwQDmRa7djrkUI';

export default function GourmetGacha() {
  const [genre, setGenre] = useState("");
  const [data, setData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGachaing, setIsGachaing] = useState(false);
  const [hasGachaDone, setHasGachaDone] = useState(false);

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(cell => cell.replace(/^"|"$/g, ''));
  };

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=シート1`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('シートにデータがありません');
      }
      
      const header = parseCSVLine(lines[0]);
      const dataLines = lines.slice(1);
      
      const formattedData = dataLines
        .map(line => parseCSVLine(line))
        .filter(row => row && row.length > 0 && row[0]?.trim())
        .map(row => {
          const restaurant = {};
          header.forEach((column, index) => {
            restaurant[column] = row[index] || '';
          });
          
          const genre1 = restaurant['ジャンル'] || restaurant['genre1'] || '';
          const genre2 = restaurant['ジャンル2'] || restaurant['genre2'] || '';
          const combinedGenre = genre2 ? `${genre1}, ${genre2}` : genre1;
          
          return {
            name: restaurant['店名'] || restaurant['name(店名)'] || '',
            genre: combinedGenre,
            link: restaurant['マップ'] || restaurant['link(Gmap)'] || '',
            location: restaurant['地名'] || restaurant['location(市)'] || '',
            station: restaurant['駅名'] || restaurant['station1(駅)'] || '',
            station2: restaurant['駅名2'] || restaurant['station2(駅)'] || ''
          };
        })
        .filter(item => item.name.trim());
      
      setData(formattedData);
      
    } catch (err) {
      console.error('データ取得エラー:', err);
      setError(`データの取得に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  const toHiragana = (str) => {
    if (!str) return "";
    return str.replace(/[ァ-ン]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));
  };

  const handleGacha = async () => {
    if (!genre.trim()) {
      alert('ジャンルを入力してください！');
      return;
    }

    setIsGachaing(true);
    setHasGachaDone(false);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const filtered = data.filter((store) =>
      toHiragana(store.genre).includes(toHiragana(genre))
    );

    if (filtered.length === 0) {
      setResults([]);
      setIsGachaing(false);
      setHasGachaDone(true);
      return;
    }

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(5, shuffled.length));
    
    setResults(selected);
    setIsGachaing(false);
    setHasGachaDone(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
      {/* ヘッダー */}
      <div className="pt-12 pb-8 px-4 text-center">
        <div className="inline-block animate-bounce mb-4">
          <Sparkles className="h-16 w-16 text-yellow-300 mx-auto" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 drop-shadow-lg">
          奈良グルメガチャ
        </h1>
        <p className="text-lg sm:text-xl text-white/90 font-medium">
          ジャンルを入れてガチャを回そう！
        </p>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* 入力エリア */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-4 text-center">
            🍽️ ジャンルを入力
          </label>
          <input
            type="text"
            className="w-full px-6 py-4 text-lg border-4 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
            placeholder="ラーメン、イタリアン、カフェなど"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGacha()}
          />

          <button
            onClick={handleGacha}
            disabled={isGachaing}
            className={`w-full mt-6 px-8 py-5 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl ${
              isGachaing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 text-white'
            }`}
          >
            {isGachaing ? (
              <span className="flex items-center justify-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin" />
                ガチャ中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Sparkles className="h-6 w-6" />
                ガチャを回す！
              </span>
            )}
          </button>
        </div>

        {/* 結果表示 */}
        {hasGachaDone && (
          <div className="space-y-4">
            {results.length > 0 ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg mb-2">
                    🎉 {results.length}件ヒット！
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base">
                    気になるお店をクリックして詳細を見よう！
                  </p>
                </div>

                {results.map((store, idx) => (
                  <a
                    key={idx}
                    href={store.link || '#'}
                    target={store.link ? "_blank" : "_self"}
                    rel={store.link ? "noopener noreferrer" : undefined}
                    className={`block bg-white/95 backdrop-blur rounded-2xl shadow-xl p-5 sm:p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-fadeIn ${
                      store.link ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex-1">
                        {store.name}
                      </h3>
                      <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full whitespace-nowrap ml-3">
                        {store.genre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {store.location}
                        {store.station && <span className="ml-1">/ {store.station}</span>}
                        {store.station2 && <span className="ml-1">/ {store.station2}</span>}
                      </span>
                    </div>

                    {store.link && (
                      <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                        <ExternalLink className="h-4 w-4" />
                        Googleマップで見る
                      </div>
                    )}
                  </a>
                ))}

                <button
                  onClick={handleGacha}
                  className="w-full mt-6 px-6 py-4 bg-white/90 backdrop-blur text-purple-600 font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:bg-white"
                >
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    もう一度回す
                  </span>
                </button>
              </>
            ) : (
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  該当するお店が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-6">
                  違うジャンルで試してみてください
                </p>
                <button
                  onClick={() => {
                    setGenre("");
                    setHasGachaDone(false);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all"
                >
                  ジャンルを変える
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}