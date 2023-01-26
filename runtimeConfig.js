exports.publicRuntimeConfig = {
	API_KEY: process.env.API_KEY || '',
    SECRET_KEY: process.env.SECRET_KEY || '',
    BINANCE_API: process.env.BINANCE_API || 'https://api.binance.com',
    WEBSOCKET_BINANCE: process.env.WEBSOCKET_BINANCE || 'wss://stream.binance.com:9443/ws'
}
