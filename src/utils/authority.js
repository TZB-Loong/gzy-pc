// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  return localStorage.getItem('authority') || 'admin';
}
export function setSession(key,val) {
  return sessionStorage.setItem(key, val);
}
export function setAuthority(authority) {
  return localStorage.setItem('authority', authority);
}
