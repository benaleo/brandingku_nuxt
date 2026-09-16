// AES-GCM protects the fields; RSA-OAEP wraps a fresh per-request AES key.
// Only the public RSA key is sent by the API. Production requires HTTPS.
export async function encryptLoginCredentials(email: string, password: string, publicKey: string) {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) throw new Error('login encryption unavailable')
  const bytes = Uint8Array.from(atob(publicKey), char => char.charCodeAt(0))
  const rsaKey = await subtle.importKey('spki', bytes, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['wrapKey'])
  const aesKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
  const wrappedKey = await subtle.wrapKey('raw', aesKey, rsaKey, 'RSA-OAEP')
  const base64 = (value: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...(value instanceof Uint8Array ? value : new Uint8Array(value))))
  const encoder = new TextEncoder()
  const issuedAt = Math.floor(Date.now() / 1000)
  const id = crypto.randomUUID()
  const encrypt = async (value: string, field: string) => {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const data = await subtle.encrypt({
      name: 'AES-GCM', iv, tagLength: 128,
      additionalData: encoder.encode(`login:${field}:v1`),
    }, aesKey, encoder.encode(JSON.stringify({ value, issuedAt, id })))
    return JSON.stringify({ v: 1, key: base64(wrappedKey), iv: base64(iv), data: base64(data) })
  }
  return { email: await encrypt(email, 'email'), password: await encrypt(password, 'password') }
}
