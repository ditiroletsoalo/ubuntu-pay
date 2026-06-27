/**
 * infobip.js — QuikPay Infobip SMS + Voice Notification Module
 *
 * 5 recipients, each with their own API key, from/to numbers and language.
 * Call: await notifyBeneficiary(beneficiaryId, amount)
 */

const BASE_URL = "api.infobip.com";

// ── Recipient registry ─────────────────────────────────────────────────────
// Each entry is keyed by the beneficiaryId used in server.js BENEFICIARIES.
// Language choices: "en" | "zu" | "xh" | "af" | "nso"
const RECIPIENTS = {
  // Nomsa Dlamini — existing key already in the original Python script
  "4501015800080": {
    name:     "Nomsa",
    to:       "27848346826",
    from:     "3851557798",
    apiKey:   "ddeb6accfb4d561fe8db05674be2a2f5-e204a621-e8d1-4fa2-ac10-672710844e03",
    language: "zu",   // isiZulu
  },

  // Thandi Mokoena
  "5203024200081": {
    name:     "Thandi",
    to:       "27719654387",
    from:     "38515507799",
    apiKey:   "e43e37e32f66c5de6e0fd6fea050877d-d7e89f1d-4f88-4b32-8f5a-be0636f45cb7",
    language: "nso",  // SePedi
  },

  // Gladys Sithole
  "4809034100082": {
    name:     "Gladys",
    to:       "27826787482",
    from:     "38515507799",
    apiKey:   "a57d5cffc2ebbe7eedb773435c931d1d-5b131abb-b625-40ca-83be-c0af882debd0",
    language: "xh",   // isiXhosa
  },

  // Rose Khumalo
  "5112023300083": {
    name:     "Rose",
    to:       "27660826868",
    from:     "447491163443",
    apiKey:   "8ca5f9e84d2a5dc1704e5e784b7dcf8d-2b534425-c761-4cc3-8477-3f05aa92eb5e",
    language: "en",   // English
  },

  // Maria van Wyk — uses the original key/number from the Python script
  "4703012100084": {
    name:     "Maria",
    to:       "27000000000",   // replace with Maria's actual number when known
    from:     "38515507799",
    apiKey:   "0396c849d55f92f4ef5f164ea662790f-ba6b7b07-6cf0-48ce-8a43-ec16b18c9832",
    language: "af",   // Afrikaans
  },
};

// ── Message templates (SMS + voice) per language ──────────────────────────
const TEMPLATES = {
  en: {
    sms:  (name, amount, otp) =>
      `Hello ${name}! Your SASSA money, amount R${amount.toFixed(2)} is ready for collection. ` +
      `You may proceed to your closest agent registered spazashop with your ID. ` +
      `Your OTP is ${otp}. Never share this OTP with anyone. ` +
      `All payments are in full, report any added fees. @Ubuntu PAY`,
    call: (name, amount, otp) =>
      `Hello ${name}. This is Ubuntu PAY. ` +
      `Your SASSA money, amount R${amount.toFixed(2)} is ready for collection. ` +
      `You may proceed to your closest agent registered spaza shop with your ID. ` +
      `Your OTP is ${otp}. Never share this OTP with anyone. ` +
      `All payments are in full. Please report any added fees. Goodbye.`,
  },
  zu: {
    sms:  (name, amount, otp) =>
      `Sawubona ${name}! Imali yakho ye-SASSA, eyimali ka-R${amount.toFixed(2)} isilungele ukulandwa. ` +
      `Ungaya esitolo se-agent esibhalisiwe esiseduze nawe nge-ID yakho. ` +
      `I-OTP yakho ngu ${otp}. Ungalokothi wabelane nanoma ubani nge-OTP. ` +
      `Zonke izinkokhelo zigcwele, bika noma yiziphi izindleko ezengeziwe. @Ubuntu PAY`,
    call: (name, amount, otp) =>
      `Sawubona ${name}. Lena i-Ubuntu PAY. ` +
      `Imali yakho ye-SASSA, eyimali ka-R${amount.toFixed(2)} isilungele ukulandwa. ` +
      `Ungaya esitolo se-agent esibhalisiwe esiseduze nawe nge-ID yakho. ` +
      `I-OTP yakho ngu ${otp}. Ungalokothi wabelane nanoma ubani nge-OTP. ` +
      `Zonke izinkokhelo zigcwele. Sicela ubike noma yiziphi izindleko ezengeziwe. Sale kahle.`,
  },
  xh: {
    sms:  (name, amount, otp) =>
      `Molo ${name}! Imali yakho ye-SASSA, esixa esiyi-R${amount.toFixed(2)} ilungele ukulandwa. ` +
      `Ungaya kwivenkile ye-agent ebhalisiweyo ekufuphi nawe nge-ID yakho. ` +
      `I-OTP yakho ngu ${otp}. Soze wabelane ngale-OTP nabani na. ` +
      `Zonke iintlawulo zipheleleyo, xela nayiphi na imali eyongezelelweyo. @Ubuntu PAY`,
    call: (name, amount, otp) =>
      `Molo ${name}. Le yi-Ubuntu PAY. ` +
      `Imali yakho ye-SASSA, esixa esiyi-R${amount.toFixed(2)} ilungele ukulandwa. ` +
      `Ungaya kwivenkile ye-agent ebhalisiweyo ekufuphi nawe nge-ID yakho. ` +
      `I-OTP yakho ngu ${otp}. Soze wabelane ngale-OTP nabani na. ` +
      `Zonke iintlawulo zipheleleyo. Nceda uxele nayiphi na imali eyongezelelweyo. Sala kakuhle.`,
  },
  af: {
    sms:  (name, amount, otp) =>
      `Hallo ${name}! Jou SASSA-geld, ten bedrae van R${amount.toFixed(2)} is gereed om afgehaal te word. ` +
      `Jy kan na jou naaste geregistreerde agent-spazawinkel gaan met jou ID. ` +
      `Jou OTP is ${otp}. Deel hierdie OTP nooit met iemand nie. ` +
      `Alle betalings is ten volle, rapporteer enige bykomende fooie. @Ubuntu PAY`,
    call: (name, amount, otp) =>
      `Goeiedag ${name}. Dit is Ubuntu PAY. ` +
      `Jou SASSA-geld, ten bedrae van R${amount.toFixed(2)} is gereed om afgehaal te word. ` +
      `Jy kan na jou naaste geregistreerde agent-spazawinkel gaan met jou ID. ` +
      `Jou OTP is ${otp}. Deel hierdie OTP nooit met iemand nie. ` +
      `Alle betalings is ten volle. Rapporteer asseblief enige bykomende fooie. Totsiens.`,
  },
  nso: {
    sms:  (name, amount, otp) =>
      `Dumela ${name}! Tšhelete ya gago ya SASSA, e lekanago R${amount.toFixed(2)} e itokišeditše go tšeelwa. ` +
      `O ka ya lebenkeleng la moemedi le le ngwadišitšwego le le gaufi le gago le ID ya gago. ` +
      `OTP ya gago ke ${otp}. Le ka mohla o se abelane le motho le OTP ye. ` +
      `Ditefelo ka moka di feletše, bega ditshenyagalelo dife goba dife tše di okeditšwego. @Ubuntu PAY`,
    call: (name, amount, otp) =>
      `Dumela ${name}. Ke Ubuntu PAY. ` +
      `Tšhelete ya gago ya SASSA, e lekanago R${amount.toFixed(2)} e itokišeditše go tšeelwa. ` +
      `O ka ya lebenkeleng la moemedi le le ngwadišitšwego le le gaufi le gago le ID ya gago. ` +
      `OTP ya gago ke ${otp}. Le ka mohla o se abelane le motho le OTP ye. ` +
      `Ditefelo ka moka di feletše. Hle bega ditshenyagalelo dife goba dife tše di okeditšwego. Sala gabotse.`,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function makeHeaders(apiKey) {
  return {
    Authorization: `App ${apiKey}`,
    "Content-Type": "application/json",
    Accept:         "application/json",
  };
}

async function sendSMS(recipient, amount, otp) {
  const { name, to, from, apiKey, language } = recipient;
  const tmpl = TEMPLATES[language] || TEMPLATES.en;
  const text  = tmpl.sms(name, amount, otp);

  console.log(`[Infobip SMS] → ${to} | ${language} | ${text}`);

  const res = await fetch(`https://${BASE_URL}/sms/2/text/advanced`, {
    method:  "POST",
    headers: makeHeaders(apiKey),
    body: JSON.stringify({
      messages: [{ from: "QuikPay", destinations: [{ to }], text }],
    }),
  });

  const data = await res.json();
  if (res.ok) {
    const msg = data.messages?.[0];
    console.log(`[Infobip SMS] ✅ id=${msg?.messageId} status=${msg?.status?.name}`);
  } else {
    console.error(`[Infobip SMS] ❌ ${res.status}:`, JSON.stringify(data));
  }
}

async function makeVoiceCall(recipient, amount, otp) {
  const { name, to, from, apiKey, language } = recipient;
  const tmpl  = TEMPLATES[language] || TEMPLATES.en;
  const script = tmpl.call(name, amount, otp);
  const toClean = to.replace("+", "");

  console.log(`[Infobip TTS] → ${toClean} | ${language} | ${script}`);

  const res = await fetch(`https://${BASE_URL}/tts/3/advanced`, {
    method:  "POST",
    headers: makeHeaders(apiKey),
    body: JSON.stringify({
      messages: [{
        destinations: [{ to: toClean }],
        from,
        language: "en",               // Infobip TTS engine — keep "en" for all
        text:     script,
        voice:    { name: "Joanna", gender: "female" },
      }],
    }),
  });

  const data = await res.json();
  if (res.ok) {
    const msg = data.messages?.[0];
    console.log(`[Infobip TTS] ✅ id=${msg?.messageId} status=${msg?.status?.name}`);
  } else {
    console.error(`[Infobip TTS] ❌ ${res.status}:`, JSON.stringify(data));
  }
}

// ── Public API ─────────────────────────────────────────────────────────────
/**
 * Send SMS + voice call to a beneficiary after their grant is paid.
 * Fires-and-forgets (non-blocking) — errors are logged, not thrown.
 *
 * @param {string} beneficiaryId  — e.g. "4501015800080"
 * @param {number} amount         — e.g. 350
 * @param {string} otp            — 4-digit one-time PIN, e.g. "0427"
 */
export async function notifyBeneficiary(beneficiaryId, amount, otp) {
  const recipient = RECIPIENTS[beneficiaryId];
  if (!recipient) {
    console.warn(`[Infobip] No recipient config for beneficiaryId=${beneficiaryId}`);
    return;
  }

  // Run SMS and voice call in parallel; errors are caught individually
  await Promise.allSettled([
    sendSMS(recipient, amount, otp).catch(err =>
      console.error("[Infobip SMS error]", err.message)),
    makeVoiceCall(recipient, amount, otp).catch(err =>
      console.error("[Infobip TTS error]", err.message)),
  ]);
}
