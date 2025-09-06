# セットアップガイド

## OpenAI APIキーの設定方法

### 1. OpenAI APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウントを作成またはログイン
3. [API Keys](https://platform.openai.com/api-keys)ページに移動
4. 「Create new secret key」をクリック
5. キー名を入力して「Create secret key」をクリック
6. 生成されたAPIキーをコピー（`sk-`で始まる文字列）

### 2. APIキーの設定

`config.js`ファイルを開き、以下の箇所にAPIキーを設定してください：

```javascript
const API_CONFIG = {
    // OpenAI APIキーをここに設定してください
    OPENAI_API_KEY: 'sk-your-api-key-here', // ここに取得したAPIキーを貼り付け
    
    // その他の設定...
};
```

### 3. ファイル構成の確認

以下のファイルが正しく配置されていることを確認してください：

```
speech-fireworks-game/
├── index.html          # メインアプリケーション
├── config.js           # API設定ファイル
├── sentiment-api.js    # 感情分析APIサービス
├── README.md           # 使用方法
└── setup-guide.md      # このファイル
```

### 4. ローカルサーバーの起動

HTTPS環境またはlocalhostで実行する必要があります：

#### Pythonを使用する場合
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Node.jsを使用する場合
```bash
# npx serveを使用
npx serve .

# またはhttp-serverを使用
npx http-server
```

#### PHPを使用する場合
```bash
php -S localhost:8000
```

### 5. ブラウザでアクセス

ブラウザで以下のURLにアクセスしてください：
- `http://localhost:8000`
- `http://127.0.0.1:8000`

## トラブルシューティング

### APIキーエラー
- **エラー**: "OpenAI APIキーが設定されていません"
- **解決方法**: `config.js`ファイルでAPIキーが正しく設定されているか確認

### APIキー形式エラー
- **エラー**: "OpenAI APIキーの形式が正しくありません"
- **解決方法**: APIキーが`sk-`で始まっているか確認

### ネットワークエラー
- **エラー**: "API呼び出しがタイムアウトしました"
- **解決方法**: インターネット接続を確認し、ファイアウォール設定を確認

### CORSエラー
- **エラー**: ブラウザのコンソールにCORSエラーが表示される
- **解決方法**: ローカルサーバーを使用してHTTPS環境で実行

### 音声認識エラー
- **エラー**: 音声認識が動作しない
- **解決方法**: 
  - HTTPS環境またはlocalhostで実行
  - マイクのアクセス許可を確認
  - ブラウザが音声認識APIに対応しているか確認

## セキュリティ注意事項

### APIキーの保護
- APIキーを公開リポジトリにコミットしないでください
- 本番環境では環境変数を使用してください
- APIキーの使用量を定期的に確認してください

### ローカル開発環境
- 開発時はlocalhostまたはHTTPS環境で実行してください
- 本番環境では適切なセキュリティ設定を行ってください

## 設定のカスタマイズ

### API設定の変更
`config.js`ファイルで以下の設定を変更できます：

```javascript
const API_CONFIG = {
    OPENAI_API_KEY: 'your-api-key',
    MODEL: 'gpt-4o-mini',        // 使用するモデル
    MAX_TOKENS: 1000,            // 最大トークン数
    TEMPERATURE: 0.1,            // 温度パラメータ
    TIMEOUT: 30000,              // タイムアウト時間（ミリ秒）
    ENABLE_API_KEY_VALIDATION: true,  // APIキー検証の有効/無効
};
```

### 花火エフェクトの設定
`index.html`の`CONFIG`オブジェクトで以下の設定を変更できます：

```javascript
const CONFIG = {
    DOT_GAP: 3,           // ドットのサンプリング間隔
    HOLD_MS: 1000,        // 文字形状を保持する時間
    SPREAD_SPEED: 2,      // 拡散速度
    FADE_SPEED: 0.02,     // フェード速度
    FONT_SIZE_BASE: 120,  // ベースフォントサイズ
    FONT_SIZE_MIN: 40,    // 最小フォントサイズ
    MAX_TEXT_WIDTH: 0.8   // 画面幅に対する最大テキスト幅
};
```

## サポート

問題が解決しない場合は、以下の情報とともにサポートに連絡してください：

1. 使用しているブラウザとバージョン
2. エラーメッセージの詳細
3. コンソールログの内容
4. 実行環境（OS、ローカルサーバーの種類）
