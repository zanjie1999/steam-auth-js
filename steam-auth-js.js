
async function getSteamAuthCode(secret) {
    // base64解码
    const b64key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    secret = secret.replace(/[^A-Za-z0-9\+\/\=]/g,"");
    const padding = secret.includes("=") ? secret.length - secret.indexOf("=") : 0
    const buflen = (secret.length / 4) * 3 - padding;
    const buf = new ArrayBuffer(buflen)
    const uarray = new Uint8Array(buf); 
    let i = 0, j = 0, enc1, enc2, enc3, enc4;
    while (i < secret.length) {
        enc1 = b64key.indexOf(secret.charAt(i++));
        enc2 = b64key.indexOf(secret.charAt(i++));
        enc3 = b64key.indexOf(secret.charAt(i++));
        enc4 = b64key.indexOf(secret.charAt(i++));
        uarray[j++] = (enc1 << 2) | (enc2 >> 4);
        if (enc3 != 64) uarray[j++] = ((enc2 & 15) << 4) | (enc3 >> 2);
        if (enc4 != 64) uarray[j++] = ((enc3 & 3) << 6) | enc4;
    }
    let secretU8 = Uint8Array.from(buf, c => c.charCodeAt(0));

    // 时间
    let timeIndexU32 = new DataView(new ArrayBuffer(8));
    timeIndexU32.setUint32(4, Math.floor(Date.now() / 30000), false);

    let algo = {name: "HMAC", hash: "SHA-1"};
    let key = await crypto.subtle.importKey('raw', secretU8, algo, false, ["sign"]);
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

// 在quickjs测试通过 但不await拿不到值的
let out = getSteamAuthCode('4pyTIMOgIGxhIG1vZGU=');
console.log(out);
