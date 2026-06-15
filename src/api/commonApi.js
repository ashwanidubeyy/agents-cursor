import { BASE_URL } from './apiEndPoints';

const buildUrl = (endpoint, queryParams = {}) => {
  const query = Object.keys(queryParams)
    .filter((key) => queryParams?.[key] !== undefined && queryParams?.[key] !== null && queryParams?.[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');
  return query ? `${BASE_URL}${endpoint}?${query}` : `${BASE_URL}${endpoint}`;
};

const parseResponse = (res) => {
  if (!res?.ok) {
    return Promise.reject({ status: res?.status, message: res?.statusText });
  }
  return res?.json();
};

export const getApi = (endpoint, headers = {}, queryParams = {}) => {
  return fetch(buildUrl(endpoint, queryParams), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
    .then((res) => parseResponse(res))
    .catch((err) => Promise.reject(err));
};

export const postApi = (endpoint, body = {}, headers = {}) => {
  return fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
    .then((res) => parseResponse(res))
    .catch((err) => Promise.reject(err));
};

export const patchApi = (endpoint, body = {}, headers = {}) => {
  return fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
    .then((res) => parseResponse(res))
    .catch((err) => Promise.reject(err));
};
