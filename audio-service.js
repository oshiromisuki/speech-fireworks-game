// BGM再生サービス
// ゲーム内での音楽再生を管理

class AudioService {
    constructor() {
        this.audioContext = null;
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 0.3; // デフォルト音量（30%）
        this.isMuted = false;
        this.tracks = [];
        this.currentTrackIndex = 0;
        this.loopMode = true;
        this.fadeInDuration = 2000; // フェードイン時間（ミリ秒）
        this.fadeOutDuration = 1000; // フェードアウト時間（ミリ秒）
        
        this.init();
    }

    // 初期化
    init() {
        try {
            // オーディオコンテキストの初期化
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 利用可能なトラックを設定
            this.setupTracks();
            
            console.log('オーディオサービスが初期化されました');
        } catch (error) {
            console.error('オーディオサービスの初期化に失敗しました:', error);
        }
    }

    // 利用可能なトラックを設定
    setupTracks() {
        this.tracks = [
            {
                name: 'メインテーマ',
                file: 'audio/bgm/main-theme.mp3',
                description: 'メインのBGM'
            },
            {
                name: 'リラックス',
                file: 'audio/bgm/relaxing.mp3',
                description: 'リラックス用のBGM'
            },
            {
                name: 'エレガント',
                file: 'audio/bgm/elegant.mp3',
                description: 'エレガントなBGM'
            },
            {
                name: 'ミニマル',
                file: 'audio/bgm/minimal.mp3',
                description: 'ミニマルなBGM'
            }
        ];
    }

    // トラックの読み込み
    async loadTrack(trackIndex) {
        if (trackIndex < 0 || trackIndex >= this.tracks.length) {
            throw new Error('無効なトラックインデックスです');
        }

        const track = this.tracks[trackIndex];
        
        try {
            // 既存のトラックを停止
            if (this.currentTrack) {
                this.stop();
            }

            // 新しいトラックを読み込み
            const audio = new Audio(track.file);
            audio.loop = this.loopMode;
            audio.volume = this.isMuted ? 0 : this.volume;
            audio.preload = 'auto';

            // 読み込み完了を待つ
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject, { once: true });
                audio.load();
            });

            this.currentTrack = audio;
            this.currentTrackIndex = trackIndex;
            
            console.log(`トラック "${track.name}" が読み込まれました`);
            return true;

        } catch (error) {
            console.error(`トラック "${track.name}" の読み込みに失敗しました:`, error);
            throw error;
        }
    }

    // BGMの再生開始
    async play(trackIndex = null) {
        try {
            // オーディオコンテキストが停止している場合は再開
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // トラックインデックスが指定されている場合は読み込み
            if (trackIndex !== null && trackIndex !== this.currentTrackIndex) {
                await this.loadTrack(trackIndex);
            }

            // 現在のトラックがない場合はデフォルトトラックを読み込み
            if (!this.currentTrack) {
                await this.loadTrack(0);
            }

            // フェードインで再生開始
            await this.fadeIn();
            
            this.isPlaying = true;
            console.log('BGM再生を開始しました');

        } catch (error) {
            console.error('BGM再生に失敗しました:', error);
            throw error;
        }
    }

    // BGMの停止
    async stop() {
        if (this.currentTrack && !this.currentTrack.paused) {
            try {
                await this.fadeOut();
                this.currentTrack.pause();
                this.currentTrack.currentTime = 0;
                this.isPlaying = false;
                console.log('BGM再生を停止しました');
            } catch (error) {
                console.error('BGM停止に失敗しました:', error);
            }
        }
    }

    // 一時停止
    pause() {
        if (this.currentTrack && !this.currentTrack.paused) {
            this.currentTrack.pause();
            this.isPlaying = false;
            console.log('BGM再生を一時停止しました');
        }
    }

    // 再開
    resume() {
        if (this.currentTrack && this.currentTrack.paused) {
            this.currentTrack.play();
            this.isPlaying = true;
            console.log('BGM再生を再開しました');
        }
    }

    // 音量設定
    setVolume(volume) {
        if (volume < 0 || volume > 1) {
            throw new Error('音量は0-1の範囲で設定してください');
        }
        
        this.volume = volume;
        if (this.currentTrack && !this.isMuted) {
            this.currentTrack.volume = volume;
        }
        
        console.log(`音量を${Math.round(volume * 100)}%に設定しました`);
    }

    // ミュート切り替え
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.currentTrack) {
            this.currentTrack.volume = this.isMuted ? 0 : this.volume;
        }
        
        console.log(`ミュート: ${this.isMuted ? 'ON' : 'OFF'}`);
        return this.isMuted;
    }

    // 次のトラックに切り替え
    async nextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        await this.play(nextIndex);
    }

    // 前のトラックに切り替え
    async previousTrack() {
        const prevIndex = this.currentTrackIndex === 0 
            ? this.tracks.length - 1 
            : this.currentTrackIndex - 1;
        await this.play(prevIndex);
    }

    // ループモードの切り替え
    toggleLoop() {
        this.loopMode = !this.loopMode;
        if (this.currentTrack) {
            this.currentTrack.loop = this.loopMode;
        }
        
        console.log(`ループモード: ${this.loopMode ? 'ON' : 'OFF'}`);
        return this.loopMode;
    }

    // フェードイン
    async fadeIn() {
        if (!this.currentTrack) return;

        this.currentTrack.volume = 0;
        this.currentTrack.play();

        const startTime = Date.now();
        const targetVolume = this.isMuted ? 0 : this.volume;

        return new Promise((resolve) => {
            const fadeInInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.fadeInDuration, 1);
                
                this.currentTrack.volume = targetVolume * progress;
                
                if (progress >= 1) {
                    clearInterval(fadeInInterval);
                    resolve();
                }
            }, 50);
        });
    }

    // フェードアウト
    async fadeOut() {
        if (!this.currentTrack) return;

        const startVolume = this.currentTrack.volume;
        const startTime = Date.now();

        return new Promise((resolve) => {
            const fadeOutInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.fadeOutDuration, 1);
                
                this.currentTrack.volume = startVolume * (1 - progress);
                
                if (progress >= 1) {
                    clearInterval(fadeOutInterval);
                    resolve();
                }
            }, 50);
        });
    }

    // 現在の状態を取得
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            isMuted: this.isMuted,
            volume: this.volume,
            currentTrackIndex: this.currentTrackIndex,
            currentTrackName: this.tracks[this.currentTrackIndex]?.name || 'なし',
            loopMode: this.loopMode,
            totalTracks: this.tracks.length
        };
    }

    // 利用可能なトラック一覧を取得
    getTracks() {
        return this.tracks.map((track, index) => ({
            index,
            name: track.name,
            file: track.file,
            description: track.description,
            isCurrent: index === this.currentTrackIndex
        }));
    }

    // トラックの存在確認
    async checkTrackExists(trackIndex) {
        if (trackIndex < 0 || trackIndex >= this.tracks.length) {
            return false;
        }

        const track = this.tracks[trackIndex];
        
        try {
            const response = await fetch(track.file, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // 利用可能なトラックを自動検出
    async detectAvailableTracks() {
        const availableTracks = [];
        
        for (let i = 0; i < this.tracks.length; i++) {
            const exists = await this.checkTrackExists(i);
            if (exists) {
                availableTracks.push(i);
            }
        }
        
        console.log(`利用可能なトラック: ${availableTracks.length}/${this.tracks.length}`);
        return availableTracks;
    }

    // サービス状態の取得
    getServiceStatus() {
        return {
            isInitialized: !!this.audioContext,
            audioContextState: this.audioContext?.state || 'unknown',
            hasCurrentTrack: !!this.currentTrack,
            tracks: this.getTracks()
        };
    }
}

// シングルトンインスタンスの作成
const audioService = new AudioService();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { AudioService, audioService };
} else {
    // ブラウザ環境
    window.AudioService = AudioService;
    window.audioService = audioService;
}
