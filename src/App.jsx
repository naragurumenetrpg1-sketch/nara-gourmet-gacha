import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, MapPin, ExternalLink, Dices } from "lucide-react";

const SHEET_ID = '19O0ge4LPff4dkPomR3tWJvH6C7zCufwQDmRa7djrkUI';

export default function GourmetGacha() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGachaing, setIsGachaing] = useState(false);
  const [hasGachaDone, setHasGachaDone] = useState(false);
  const [showCards, setShowCards] = useState(false);

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
    setIsGachaing(true);
    setHasGachaDone(false);
    setShowCards(false);

    // アニメーション時間
    await new Promise(resolve => setTimeout(resolve, 2000));

    let filtered;

    if (!searchTerm.trim()) {
      // ジャンル未入力の場合：全件からランダム
      filtered = [...data];
    } else {
      // 入力がある場合：ジャンル/地域/駅名で検索
      filtered = data.filter((store) =>
        toHiragana(store.genre).includes(toHiragana(searchTerm)) ||
        toHiragana(store.location).includes(toHiragana(searchTerm)) ||
        toHiragana(store.station).includes(toHiragana(searchTerm)) ||
        toHiragana(store.station2).includes(toHiragana(searchTerm))
      );
    }

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
    
    // カード表示アニメーション用
    setTimeout(() => setShowCards(true), 100);
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
          <Sparkles className="h-16 w-16 text-yellow-300 mx-auto drop-shadow-lg" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 drop-shadow-lg animate-pulse">
          奈良グルメガチャ
        </h1>
        <p className="text-lg sm:text-xl text-white/90 font-medium">
          あなたにぴったりのお店が見つかるかも！？
        </p>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* 入力エリア */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 transform hover:scale-105 transition-transform duration-300">
          <label className="block text-lg font-bold text-gray-800 mb-4 text-center">
            🎯 ジャンル / 地域 / 駅名
          </label>
          <input
            type="text"
            className="w-full px-6 py-4 text-lg border-4 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
            placeholder="例: ラーメン、奈良市、奈良駅（空欄でもOK！）"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGacha()}
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 何も入力せずにガチャを回すと、全店舗からランダムに選ばれます！
          </p>

          <button
            onClick={handleGacha}
            disabled={isGachaing}
            className={`w-full mt-6 px-8 py-5 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl ${
              isGachaing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 text-white animate-pulse'
            }`}
          >
            {isGachaing ? (
              <span className="flex items-center justify-center gap-3">
                <Dices className="h-6 w-6 animate-spin" />
                ガチャ回転中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Sparkles className="h-6 w-6 animate-bounce" />
                ガチャを回す！
              </span>
            )}
          </button>
        </div>

        {/* ガチャ演出 */}
        {isGachaing && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative">
                <Dices className="h-32 w-32 text-yellow-300 mx-auto animate-spin-slow drop-shadow-2xl" />
                <Sparkles className="h-16 w-16 text-white absolute top-0 left-0 animate-ping" />
                <Sparkles className="h-16 w-16 text-white absolute bottom-0 right-0 animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
              <p className="text-4xl font-bold text-white mt-8 animate-pulse">
                ガチャ回転中...
              </p>
              <p className="text-xl text-white/80 mt-2">
                何が出るかな？✨
              </p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {hasGachaDone && !isGachaing && (
          <div className="space-y-4">
            {results.length > 0 ? (
              <>
                <div className="text-center mb-6 animate-bounce-once">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg mb-2">
                    🎉 当たり！{results.length}件ヒット！
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base">
                    気になるお店をクリックして詳細を見よう！
                  </p>
                </div>

                {showCards && results.map((store, idx) => (
                  <a
                    key={idx}
                    href={store.link || '#'}
                    target={store.link ? "_blank" : "_self"}
                    rel={store.link ? "noopener noreferrer" : undefined}
                    className={`block bg-white/95 backdrop-blur rounded-2xl shadow-xl p-5 sm:p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl animate-slideIn ${
                      store.link ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    style={{ animationDelay: `${idx * 150}ms` }}
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
              <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  該当するお店が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-6">
                  違う条件で試してみてください
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setHasGachaDone(false);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all"
                >
                  条件を変える
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(720deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}