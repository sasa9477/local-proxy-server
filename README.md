## wsl 開発用 windows プロキシサーバー

### 概要

wsl で実行したサーバーを スマートフォンの実機で確認するための プロキシサーバーです。  
実機は windows と 同一 LAN 内、かつ windows のネットワーク接続設定が プライベートになっている必要があります。

### 構築手順

mkcert を scoop からインストールします。  
レポジトリの ディレクトリ内で localhost の SSL 証明書を発行します。  
`yarn make` コマンドで ビルドすると out フォルダーに 実行ファイル(.exe)と セットアップ実行ファイル(Setup.exe)が作成されます。  
セットアップ実行ファイルでインストールしたアプリは windows の場合、`%LOCALAPPDATA%\local_proxy_server` にインストールされます。(2023/04/02 時点ではデスクトップショートカット等が作成されません。)

SSL 証明書の発行

```PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop bucket add extras
scoop install mkcert
mkcert localhost
```

### 使い方

Target URL に プロキシ先のサーバーオリジンを指定し、待ち受けたいポートを指定して、サーバーを起動ボタンを押してください。  
初回は windows ファイアウォールの画面が表示されるので、プライベートを選択して接続を許可してください。  
プライベートを選択できない場合は、接続している Wifi の設定がパブリックになっている可能性があります。

HTTPS オプションは自己証明書を使用しているため、接続先でも自己証明書を使用している場合は、エラーになる可能性があります。  
WS オプションは プロキシサーバー経由で WebSocket での接続を有効にします。(2023/04/02 時点では有効にしても、WebSocket での接続ができません。)
