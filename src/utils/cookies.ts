export function setCookie(name: string, value: string, days?: number) {
  let cookieString = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += '; expires=' + date.toUTCString();
  }

  cookieString += '; path=/';

  document.cookie = cookieString;
}

export function getCookie(name: string): string | undefined {
  return document.cookie.split('; ').reduce<string | undefined>((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, undefined);
}

export function removeCookie(name: string) {
  setCookie(name, '', -1);
}
