
async function getSteamAuthCode(secret) {
    let secretU8 = Uint8Array.from(atob(secret), c => c.charCodeAt(0));

    // 时间
    let timeIndexU32 = new DataView(new ArrayBuffer(8));
    timeIndexU32.setUint32(4, Math.floor(Date.now() / 30000), false);

    let key = await crypto.subtle.importKey('raw', secretU8, {name: "HMAC", hash: "SHA-1"}, false, ["sign"]);
    let hmac = await crypto.subtle.sign('HMAC', key, timeIndexU32);
    hmac = new DataView(hmac);

    let start = hmac.getUint8(19) & 0x0F;
    let rawCode =  hmac.getUint32(start, false) & 0x7FFFFFFF;
    
    // 输出
    const chars = '23456789BCDFGHJKMNPQRTVWXY';
    let authCode = '';
    for (let i = 0; i < 5; i++) {
        authCode += chars.charAt(rawCode % chars.length);
        rawCode /= chars.length;
    }
    return authCode;
}
