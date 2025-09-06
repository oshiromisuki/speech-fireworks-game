// 感情分析APIサービス
// OpenAI APIを使用した感情分析機能

class SentimentAnalysisService {
    constructor() {
        this.isInitialized = false;
        this.apiConfig = null;
        this.init();
    }

    // 初期化
    init() {
        try {
            // 設定ファイルからAPI設定を取得
            if (typeof API_CONFIG !== 'undefined') {
                this.apiConfig = API_CONFIG;
                this.isInitialized = true;
                console.log('感情分析サービスが初期化されました');
            } else {
                console.error('API_CONFIGが見つかりません。config.jsファイルが読み込まれているか確認してください。');
            }
        } catch (error) {
            console.error('感情分析サービスの初期化に失敗しました:', error);
        }
    }

    // 感情分析用JSON Schema
    getSentimentSchema() {
        return {
            "name": "Sentiment10",
            "schema": {
                "type": "object",
                "properties": {
                    "score": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 10,
                        "description": "1=極ネガ, 10=極ポジの整数"
                    },
                    "labelJa": {
                        "type": "string",
                        "enum": ["最悪","ネガ","ややネガ","ややポジ","ポジ","最高"]
                    },
                    "confidence": { 
                        "type": "number", 
                        "minimum": 0, 
                        "maximum": 1 
                    },
                    "color": {
                        "type": "object",
                        "properties": {
                            "hex": { 
                                "type": "string", 
                                "pattern": "^#([0-9A-Fa-f]{6})$" 
                            },
                            "rgb": {
                                "type": "object",
                                "properties": {
                                    "r": { "type": "integer", "minimum": 0, "maximum": 255 },
                                    "g": { "type": "integer", "minimum": 0, "maximum": 255 },
                                    "b": { "type": "integer", "minimum": 0, "maximum": 255 }
                                },
                                "required": ["r","g","b"],
                                "additionalProperties": false
                            },
                            "hsl": {
                                "type": "object",
                                "properties": {
                                    "h": { "type": "number", "minimum": 0, "maximum": 360 },
                                    "s": { "type": "number", "minimum": 0, "maximum": 100 },
                                    "l": { "type": "number", "minimum": 0, "maximum": 100 }
                                },
                                "required": ["h","s","l"],
                                "additionalProperties": false
                            }
                        },
                        "required": ["hex","rgb","hsl"],
                        "additionalProperties": false
                    },
                    "rationale": { 
                        "type": "string", 
                        "maxLength": 80 
                    }
                },
                "required": ["score","labelJa","confidence","color","rationale"],
                "additionalProperties": false
            },
            "strict": true
        };
    }

    // システムプロンプト
    getSystemPrompt() {
        return `あなたは厳密な感情分類器です。入力テキストの全体的なセンチメントを、1〜10の整数スコアで返します。

1=極めてネガティブ、5=ややネガ、6=ややポジ、10=極めてポジ。

句読点や絵文字も手掛かりにしつつ、日本語の否定/婉曲/皮肉に注意。文脈が混在する場合は最も支配的な感情を選ぶ。

不明・宣伝・命令・スパム等でも必ず1〜10のいずれかに丸め、信頼度(0.0〜1.0)を返す。

色マッピング：スコアを0〜1に正規化し、赤(#FF3B30) → 黄(#FFD60A) → 緑(#34C759) の二段線形補間でHEX/RGB/HSLの各表現を返す。

スコア→語ラベル：1–2「最悪」、3–4「ネガ」、5「ややネガ」、6「ややポジ」、7–8「ポジ」、9–10「最高」。

出力説明rationaleは短く日本語で（最大80字）。

安全：攻撃的・差別的表現などの有無はスコアに過度反映せず、テキストの情動に基づいて判定。`;
    }

    // APIキーの検証
    validateApiKey() {
        if (!this.apiConfig || !this.apiConfig.OPENAI_API_KEY) {
            throw new Error('OpenAI APIキーが設定されていません。config.jsファイルでAPIキーを設定してください。');
        }
        
        if (!this.apiConfig.OPENAI_API_KEY.startsWith('sk-')) {
            throw new Error('OpenAI APIキーの形式が正しくありません。sk-で始まるキーを設定してください。');
        }
        
        return true;
    }

    // 感情分析の実行
    async analyzeSentiment(text) {
        try {
            // 初期化チェック
            if (!this.isInitialized) {
                throw new Error('感情分析サービスが初期化されていません');
            }

            // APIキー検証
            this.validateApiKey();

            // リクエストボディの作成
            const requestBody = {
                model: this.apiConfig.MODEL,
                messages: [
                    { role: 'system', content: this.getSystemPrompt() },
                    { role: 'user', content: `次のテキストのセンチメントを判定してください。\n\n【テキスト】\n${text}` }
                ],
                response_format: { 
                    type: 'json_schema', 
                    json_schema: this.getSentimentSchema() 
                },
                temperature: this.apiConfig.TEMPERATURE,
                max_tokens: this.apiConfig.MAX_TOKENS
            };

            // API呼び出し
            const response = await this.callOpenAIAPI(requestBody);
            
            // レスポンスの解析
            const result = JSON.parse(response.choices[0].message.content);
            
            // 結果の検証
            this.validateSentimentResult(result);
            
            return result;

        } catch (error) {
            console.error('感情分析エラー:', error);
            throw error;
        }
    }

    // OpenAI API呼び出し
    async callOpenAIAPI(requestBody) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiConfig.TIMEOUT);

        try {
            const response = await fetch(this.apiConfig.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.OPENAI_API_KEY}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API エラー (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('API呼び出しがタイムアウトしました');
            }
            
            throw error;
        }
    }

    // 感情分析結果の検証
    validateSentimentResult(result) {
        if (!result || typeof result !== 'object') {
            throw new Error('無効な感情分析結果です');
        }

        const requiredFields = ['score', 'labelJa', 'confidence', 'color', 'rationale'];
        for (const field of requiredFields) {
            if (!(field in result)) {
                throw new Error(`感情分析結果に必須フィールド '${field}' がありません`);
            }
        }

        if (result.score < 1 || result.score > 10) {
            throw new Error('感情スコアが範囲外です (1-10)');
        }

        if (result.confidence < 0 || result.confidence > 1) {
            throw new Error('信頼度が範囲外です (0-1)');
        }

        return true;
    }

    // 色の明度調整
    adjustColorBrightness(hex, brightness) {
        try {
            // HEXをRGBに変換
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);

            // 明度を調整
            const newR = Math.round(r * brightness);
            const newG = Math.round(g * brightness);
            const newB = Math.round(b * brightness);

            // RGBをHEXに変換
            return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        } catch (error) {
            console.warn('色の調整に失敗しました:', error);
            return hex; // 元の色を返す
        }
    }

    // サービス状態の取得
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasApiKey: !!(this.apiConfig && this.apiConfig.OPENAI_API_KEY),
            apiKeyValid: this.isInitialized && this.apiConfig && this.apiConfig.OPENAI_API_KEY.startsWith('sk-')
        };
    }

    // 設定の更新
    updateConfig(newConfig) {
        if (newConfig && typeof newConfig === 'object') {
            this.apiConfig = { ...this.apiConfig, ...newConfig };
            console.log('API設定が更新されました');
        }
    }
}

// シングルトンインスタンスの作成
const sentimentService = new SentimentAnalysisService();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { SentimentAnalysisService, sentimentService };
} else {
    // ブラウザ環境
    window.SentimentAnalysisService = SentimentAnalysisService;
    window.sentimentService = sentimentService;
}
