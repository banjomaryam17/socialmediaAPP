// lib/avatar.ts
export function avatarUrlFor(name: string, size = 64) {
    const n = encodeURIComponent(name || 'User')
    // ui-avatars: background default, rounded PNG
    return `https://ui-avatars.com/api/?name=${n}&size=${size}&format=png&rounded=true`
  }
  