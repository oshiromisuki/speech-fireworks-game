// OpenAI API設定ファイル
// このファイルでAPIキーを設定してください

const API_CONFIG = {
    // OpenAI APIキーをここに設定してください
    // 取得方法: https://platform.openai.com/api-keys
    OPENAI_API_KEY: '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', // 例: 'sk-...'
    
    // API設定
    MODEL: 'gpt-4o-mini',
    ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    
    // リクエスト設定
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.1,
    TIMEOUT: 30000, // 30秒
    
    // セキュリティ設定
    ENABLE_API_KEY_VALIDATION: true,
    ALLOWED_ORIGINS: ['localhost', '127.0.0.1'], // 許可するオリジン
};

// APIキーの検証
function validateApiKey() {
    if (!API_CONFIG.OPENAI_API_KEY) {
        console.warn('OpenAI APIキーが設定されていません。config.jsファイルでAPIキーを設定してください。');
        return false;
    }
    
    if (!API_CONFIG.OPENAI_API_KEY.startsWith('sk-')) {
        console.warn('OpenAI APIキーの形式が正しくありません。sk-で始まるキーを設定してください。');
        return false;
    }
    
    return true;
}

// 環境チェック
function checkEnvironment() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (!isLocalhost && window.location.protocol !== 'https:') {
        console.warn('HTTPS環境で実行することを推奨します。');
    }
    
    return true;
}

// 設定の初期化
function initializeConfig() {
    checkEnvironment();
    const isValid = validateApiKey();
    
    if (!isValid) {
        console.error('API設定に問題があります。config.jsファイルを確認してください。');
    }
    
    return isValid;
}

// 設定をエクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { API_CONFIG, validateApiKey, checkEnvironment, initializeConfig };
} else {
    // ブラウザ環境
    window.API_CONFIG = API_CONFIG;
    window.validateApiKey = validateApiKey;
    window.checkEnvironment = checkEnvironment;
    window.initializeConfig = initializeConfig;
}
